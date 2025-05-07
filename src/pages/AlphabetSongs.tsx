import React, { useState } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { Play, Music } from 'lucide-react';

interface VideoItem {
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export const AlphabetSongs = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // ASL learning videos hosted on SignLanguage101.com CDN
  const videos: VideoItem[] = [
    {
      url: 'https://media.signlanguage101.com/videos/alphabet/a-to-z.mp4',
      title: 'ASL Alphabet - Learn American Sign Language Letters',
      description: 'Learn the basics of fingerspelling and its importance in ASL',
      thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
    },
    {
      url: 'https://media.signlanguage101.com/videos/alphabet/a-to-j.mp4',
      title: 'Learn ASL: Letters A-J',
      description: 'Master the first ten letters of the ASL alphabet',
      thumbnailUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
    },
    {
      url: 'https://media.signlanguage101.com/videos/alphabet/k-to-t.mp4',
      title: 'Learn ASL: Letters K-T',
      description: 'Learn the next ten letters of the ASL alphabet',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
    },
    {
      url: 'https://media.signlanguage101.com/videos/alphabet/u-to-z.mp4',
      title: 'Learn ASL: Letters U-Z',
      description: 'Complete the alphabet with the final letters',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Fun ASL Alphabet Videos
        </h1>
        <p className="text-xl text-gray-600">
          Learn the ASL alphabet through fun and engaging videos!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div
            key={video.url}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white animate-bounce" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{video.title}</h3>
                <Music className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-gray-600">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};