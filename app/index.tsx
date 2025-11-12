import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMovies } from '../hooks/useMovies';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';

export default function MovieList() {
  const router = useRouter();
  const { data: movies, isLoading, error, refetch } = useMovies();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 px-4">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-white">Hata Oluştu</Text>
        <Text className="mt-2 text-center text-gray-400">
          {error instanceof Error ? error.message : 'Bir hata oluştu'}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 rounded-lg bg-red-600 px-6 py-3">
          <Text className="font-semibold text-white">Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      onPress={() => router.push(`/movie/${item.id}`)}
      className="mx-4 mb-4 overflow-hidden rounded-xl bg-gray-800 shadow-lg"
      activeOpacity={0.7}>
      <View className="flex-row">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="h-40 w-28" resizeMode="cover" />
        ) : (
          <View className="h-40 w-28 items-center justify-center bg-gray-700">
            <Ionicons name="film-outline" size={40} color="#9ca3af" />
          </View>
        )}
        <View className="flex-1 justify-between p-4">
          <View>
            <Text className="text-lg font-bold text-white" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">Yönetmen: {item.director}</Text>
            <Text className="text-sm text-gray-400">Yıl: {item.year}</Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <View className="rounded-full bg-blue-600 px-3 py-1">
              <Text className="text-xs font-semibold text-white">{item.genre}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text className="ml-1 font-bold text-yellow-400">{item.rating}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-900">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-400">Filmler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovie}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="film-outline" size={80} color="#4b5563" />
              <Text className="mt-4 text-lg text-gray-400">Henüz film eklenmemiş</Text>
              <TouchableOpacity
                onPress={() => router.push('/add-movie')}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-3">
                <Text className="font-semibold text-white">İlk Filmi Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/add-movie')}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-2xl"
        activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
