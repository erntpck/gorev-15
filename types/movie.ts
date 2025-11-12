export interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  rating: number;
  description: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MovieFormData {
  title: string;
  director: string;
  year: string;
  genre: string;
  rating: string;
  description: string;
}

export interface MovieInput {
  title: string;
  director: string;
  year: number;
  genre: string;
  rating: number;
  description: string;
  image?: any;
  imageUrl?: string | null;
}
