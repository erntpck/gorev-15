import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Movie, MovieInput } from '../types/movie';
import { db, storage } from '@/services/firebase';

export const useMovies = () => {
  return useQuery<Movie[]>({
    queryKey: ['movies'],
    queryFn: async () => {
      const moviesCollection = collection(db, 'movies');
      const snapshot = await getDocs(moviesCollection);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Movie[];
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery<Movie>({
    queryKey: ['movie', id],
    queryFn: async () => {
      const movieDoc = doc(db, 'movies', id);
      const snapshot = await getDoc(movieDoc);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Movie;
      }
      throw new Error('Film bulunamadı');
    },
    enabled: !!id,
  });
};

export const useAddMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movieData: MovieInput) => {
      let imageUrl: string | null = null;

      if (movieData.image) {
        const imageRef = ref(storage, `movies/${Date.now()}_${movieData.image.name}`);
        await uploadBytes(imageRef, movieData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const moviesCollection = collection(db, 'movies');
      const docRef = await addDoc(moviesCollection, {
        title: movieData.title,
        director: movieData.director,
        year: movieData.year,
        genre: movieData.genre,
        rating: movieData.rating,
        description: movieData.description,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
      });

      return { id: docRef.id, ...movieData, imageUrl } as Movie;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, movieData }: { id: string; movieData: MovieInput }) => {
      let imageUrl = movieData.imageUrl;

      if (movieData.image && typeof movieData.image !== 'string') {
        const imageRef = ref(storage, `movies/${Date.now()}_${movieData.image.name}`);
        await uploadBytes(imageRef, movieData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const movieDoc = doc(db, 'movies', id);
      await updateDoc(movieDoc, {
        title: movieData.title,
        director: movieData.director,
        year: movieData.year,
        genre: movieData.genre,
        rating: movieData.rating,
        description: movieData.description,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString(),
      });

      return { id, ...movieData, imageUrl } as Movie;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movie', data.id] });
    },
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const movieDoc = doc(db, 'movies', id);
      await deleteDoc(movieDoc);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
};
