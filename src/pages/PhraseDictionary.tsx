import React, { useState } from 'react';
import { VideoModal } from '../components/VideoModal';
import { Play, Video } from 'lucide-react';

interface VideoItem {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export const PhraseDictionary = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Kid-friendly ASL phrase videos
  const videos: VideoItem[] = [
    {
      videoId: 'YGz3PKuHIX0',
      title: 'Learn ASL: Colors and Animals for Kids!',
      description: 'Fun and easy ASL signs for colors and animals that kids will love to learn.',
      thumbnailUrl: 'https://img.youtube.com/vi/YGz3PKuHIX0/maxresdefault.jpg'
    },
    {
      videoId: 'LXVMR_a0pHw',
      title: 'ASL for Kids - Basic Words and Phrases',
      description: 'Learn everyday signs with fun animations and easy-to-follow instructions.',
      thumbnailUrl: 'https://img.youtube.com/vi/LXVMR_a0pHw/maxresdefault.jpg'
    },
    {
      videoId: 'q7DYC_yzcO0',
      title: 'ASL Signs for Feelings and Emotions',
      description: 'Learn how to express feelings in ASL with this fun, kid-friendly lesson.',
      thumbnailUrl: 'https://img.youtube.com/vi/q7DYC_yzcO0/maxresdefault.jpg'
    },
    {
      videoId: '1w4gotpOZBE',
      title: 'ASL Food Signs for Kids',
      description: 'Learn signs for favorite foods and snacks in this engaging lesson.',
      thumbnailUrl: 'https://img.youtube.com/vi/1w4gotpOZBE/maxresdefault.jpg'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Fun ASL Phrases for Kids
        </h1>
        <p className="text-xl text-gray-600">
          Learn sign language through fun and engaging videos!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div
            key={video.videoId}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white animate-bounce" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{video.title}</h3>
                <Video className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-gray-600">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          videoId={selectedVideo.videoId}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};