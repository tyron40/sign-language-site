export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  order: number;
  signs: Sign[];
  relatedVideos?: RelatedVideo[];
}

export interface RelatedVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export interface Sign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  handpose: number[][];
}