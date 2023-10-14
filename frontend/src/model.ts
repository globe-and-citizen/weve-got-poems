// LoginInput
export interface LoginInput {
  email: string;
  password: string;
}

// LoginResponse
export interface LoginResponse {
  token: string;
  user: User;
}

// Poem
export interface Poem {
  id: number;
  title: string;
  content: string;
  author: Author;
  likes: number;
  dislikes: number;
}

// Author
export interface Author {
  id: number;
  name: string;
}

// PoemInput
export interface PoemInput {
  title: string;
  content: string;
  authorId: number;
}

// PoemResponse
export interface PoemResponse {
  message: string;
  poem: Poem;
}

// LikeInput
export interface LikeInput {
  poemId: number;
  userId: number;
}

// LikeResponse
export interface LikeResponse {
  message: string;
  likeCount: number;
}

// DislikeInput
export interface DislikeInput {
  poemId: number;
  userId: number;
}

// DislikeResponse
export interface DislikeResponse {
  message: string;
  dislikeCount: number;
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
}

// UserInput
export interface UserInput {
  name: string;
  email: string;
  password: string;
}

// UserResponse
export interface UserResponse {
  message: string;
  user: User;
}

// MessageResponse
export interface MessageResponse {
  message: string;
}

// Error
export interface Error {
  code: number;
  message: string;
}
