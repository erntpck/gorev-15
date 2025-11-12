import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useAddMovie, useUpdateMovie } from '../hooks/useMovies';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MovieFormData } from '../types/movie';

export default function AddMovie() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    editMode?: string;
    movieId?: string;
    title?: string;
    director?: string;
    year?: string;
    genre?: string;
    rating?: string;
    description?: string;
    imageUrl?: string;
  }>();
  const isEditMode = params.editMode === 'true';

  const addMovie = useAddMovie();
  const updateMovie = useUpdateMovie();

  const hasLoadedData = useRef(false);

  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    director: '',
    year: '',
    genre: '',
    rating: '',
    description: '',
  });
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && !hasLoadedData.current) {
      hasLoadedData.current = true;

      setFormData({
        title: params.title || '',
        director: params.director || '',
        year: params.year || '',
        genre: params.genre || '',
        rating: params.rating || '',
        description: params.description || '',
      });

      if (params.imageUrl) {
        setExistingImageUrl(params.imageUrl);
      }
    }
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişim için izin gerekiyor');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Film adı zorunludur');
      return;
    }
    if (!formData.director.trim()) {
      Alert.alert('Hata', 'Yönetmen adı zorunludur');
      return;
    }
    if (!formData.year.trim() || isNaN(Number(formData.year))) {
      Alert.alert('Hata', 'Geçerli bir yıl giriniz');
      return;
    }
    if (
      !formData.rating.trim() ||
      isNaN(Number(formData.rating)) ||
      parseFloat(formData.rating) < 0 ||
      parseFloat(formData.rating) > 10
    ) {
      Alert.alert('Hata', 'Geçerli bir puan giriniz (0-10 arası)');
      return;
    }

    try {
      const movieData: any = {
        title: formData.title,
        director: formData.director,
        year: parseInt(formData.year),
        rating: parseFloat(formData.rating),
        genre: formData.genre,
        description: formData.description,
      };

      if (isEditMode) {
        if (image) {
          const imageFile = await fetch(image.uri).then((r) => r.blob());
          movieData.image = imageFile;
          (movieData.image as any).name = image.fileName || `image_${Date.now()}.jpg`;
        } else {
          movieData.imageUrl = existingImageUrl;
        }

        await updateMovie.mutateAsync({
          id: params.movieId as string,
          movieData,
        });
        Alert.alert('Başarılı', 'Film güncellendi');
      } else {
        if (image) {
          const imageFile = await fetch(image.uri).then((r) => r.blob());
          movieData.image = imageFile;
          (movieData.image as any).name = image.fileName || `image_${Date.now()}.jpg`;
        }

        await addMovie.mutateAsync(movieData);
        Alert.alert('Başarılı', 'Film eklendi');
      }

      router.back();
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const isLoading = addMovie.isPending || updateMovie.isPending;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={pickImage}
            className="mb-6 h-64 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-600 bg-gray-800"
            activeOpacity={0.7}>
            {image || existingImageUrl ? (
              <Image
                source={{ uri: image?.uri || existingImageUrl || undefined }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={64} color="#4b5563" />
                <Text className="mt-2 text-gray-400">Poster Seç</Text>
              </View>
            )}
            {(image || existingImageUrl) && (
              <View className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-3">
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View className="mb-4">
            <Text className="mb-2 font-semibold text-gray-300">Film Adı *</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Örn: Inception"
              placeholderTextColor="#6b7280"
              className="rounded-lg bg-gray-800 px-4 py-3 text-white"
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-semibold text-gray-300">Yönetmen *</Text>
            <TextInput
              value={formData.director}
              onChangeText={(text) => setFormData({ ...formData, director: text })}
              placeholder="Örn: Christopher Nolan"
              placeholderTextColor="#6b7280"
              className="rounded-lg bg-gray-800 px-4 py-3 text-white"
              returnKeyType="next"
            />
          </View>

          <View className="mb-4 flex-row gap-4">
            <View className="flex-1">
              <Text className="mb-2 font-semibold text-gray-300">Yıl *</Text>
              <TextInput
                value={formData.year}
                onChangeText={(text) => setFormData({ ...formData, year: text })}
                placeholder="2010"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                className="rounded-lg bg-gray-800 px-4 py-3 text-white"
                returnKeyType="next"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 font-semibold text-gray-300">Puan (0-10) *</Text>
              <TextInput
                value={formData.rating}
                onChangeText={(text) => setFormData({ ...formData, rating: text })}
                placeholder="8.5"
                placeholderTextColor="#6b7280"
                keyboardType="decimal-pad"
                className="rounded-lg bg-gray-800 px-4 py-3 text-white"
                returnKeyType="next"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-semibold text-gray-300">Tür</Text>
            <TextInput
              value={formData.genre}
              onChangeText={(text) => setFormData({ ...formData, genre: text })}
              placeholder="Örn: Bilim Kurgu"
              placeholderTextColor="#6b7280"
              className="rounded-lg bg-gray-800 px-4 py-3 text-white"
              returnKeyType="next"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 font-semibold text-gray-300">Açıklama</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Film hakkında kısa bir açıklama yazın..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="h-32 rounded-lg bg-gray-800 px-4 py-3 text-white"
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mb-8 items-center rounded-lg py-4 ${
              isLoading ? 'bg-blue-800' : 'bg-blue-600'
            }`}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-bold text-white">
                {isEditMode ? 'Filmi Güncelle' : 'Filmi Ekle'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
