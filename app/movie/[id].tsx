import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMovie, useDeleteMovie } from '../../hooks/useMovies';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function MovieDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: movie, isLoading, error } = useMovie(id as string);
  const deleteMovie = useDeleteMovie();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Filmi Sil', 'Bu filmi silmek istediğinize emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteMovie.mutateAsync(id as string);
            router.back();
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Film silinirken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!movie) return;

    router.push({
      pathname: '/add-movie',
      params: {
        editMode: 'true',
        movieId: id,
        title: movie.title,
        director: movie.director,
        year: movie.year.toString(),
        genre: movie.genre,
        rating: movie.rating.toString(),
        description: movie.description,
        imageUrl: movie.imageUrl || '',
      },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-400">Film yükleniyor...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-4">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-white">Film Bulunamadı</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-3">
          <Text className="font-semibold text-white">Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView>
        {movie.imageUrl ? (
          <Image source={{ uri: movie.imageUrl }} className="h-96 w-full" resizeMode="cover" />
        ) : (
          <View className="h-96 w-full items-center justify-center bg-gray-800">
            <Ionicons name="film-outline" size={100} color="#4b5563" />
          </View>
        )}

        <View className="p-6">
          <View className="mb-4 flex-row items-start justify-between">
            <Text className="mr-4 flex-1 text-3xl font-bold text-white">{movie.title}</Text>
            <View className="flex-row items-center rounded-lg bg-yellow-500 px-4 py-2">
              <Ionicons name="star" size={20} color="white" />
              <Text className="ml-1 text-xl font-bold text-white">{movie.rating}</Text>
            </View>
          </View>

          <View className="mb-6 flex-row flex-wrap gap-3">
            <View className="flex-row items-center rounded-lg bg-gray-800 px-4 py-2">
              <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
              <Text className="ml-2 text-gray-300">{movie.year}</Text>
            </View>
            <View className="flex-row items-center rounded-lg bg-gray-800 px-4 py-2">
              <Ionicons name="pricetag-outline" size={16} color="#9ca3af" />
              <Text className="ml-2 text-gray-300">{movie.genre}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-1 text-sm text-gray-400">Yönetmen</Text>
            <Text className="text-lg font-semibold text-white">{movie.director}</Text>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm text-gray-400">Açıklama</Text>
            <Text className="text-base leading-6 text-gray-200">{movie.description}</Text>
          </View>

          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-600 py-4"
              activeOpacity={0.8}>
              <Ionicons name="pencil" size={20} color="white" />
              <Text className="ml-2 text-base font-bold text-white">Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-red-600 py-4"
              activeOpacity={0.8}>
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="trash" size={20} color="white" />
                  <Text className="ml-2 text-base font-bold text-white">Sil</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
