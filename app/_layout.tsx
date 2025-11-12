import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import '../global.css';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1f2937',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Film Listesi',
          }}
        />
        <Stack.Screen
          name="movie/[id]"
          options={{
            title: 'Film Detayı',
          }}
        />
        <Stack.Screen
          name="add-movie"
          options={{
            title: 'Film Ekle',
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
