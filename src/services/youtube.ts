import { RelatedVideo } from '../types';

// ASL Meredith's channel ID
const ASL_CHANNEL_ID = 'UCACxqsL_FA-gMD2fwil7ZXA';

// Curated videos from ASL Meredith's channel
const curatedVideos: Record<string, RelatedVideo[]> = {
  'alphabet': [
    {
      videoId: 'dJBLF8Dx_R4',
      title: 'ASL Alphabet - Learn American Sign Language Letters',
      thumbnailUrl: 'https://img.youtube.com/vi/dJBLF8Dx_R4/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: '6_gXiBe9y9Y',
      title: 'Learn ASL: Letters A-J',
      thumbnailUrl: 'https://img.youtube.com/vi/6_gXiBe9y9Y/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'zWvnGRYH3Zo',
      title: 'Learn ASL: Letters K-T',
      thumbnailUrl: 'https://img.youtube.com/vi/zWvnGRYH3Zo/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    }
  ],
  'basics': [
    {
      videoId: 'v1desDduz5M',
      title: '25 Basic ASL Signs For Beginners',
      thumbnailUrl: 'https://img.youtube.com/vi/v1desDduz5M/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'Fp9Z8Xh5CQ0',
      title: 'Common ASL Phrases Every Beginner Should Know',
      thumbnailUrl: 'https://img.youtube.com/vi/Fp9Z8Xh5CQ0/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'F1Z_c91UPk4',
      title: 'Basic ASL Conversation Practice',
      thumbnailUrl: 'https://img.youtube.com/vi/F1Z_c91UPk4/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    }
  ],
  'numbers': [
    {
      videoId: 'cJ6UFIP-Vt0',
      title: 'Numbers in ASL',
      thumbnailUrl: 'https://img.youtube.com/vi/cJ6UFIP-Vt0/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'h7hGqB0U9DE',
      title: 'Time in ASL',
      thumbnailUrl: 'https://img.youtube.com/vi/h7hGqB0U9DE/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    }
  ],
  'family': [
    {
      videoId: 'D1gJwjunBwM',
      title: 'Family Signs in ASL',
      thumbnailUrl: 'https://img.youtube.com/vi/D1gJwjunBwM/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'FV5G_LSj018',
      title: 'Extended Family Signs in ASL',
      thumbnailUrl: 'https://img.youtube.com/vi/FV5G_LSj018/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    }
  ],
  'default': [
    {
      videoId: 'v1desDduz5M',
      title: '25 Basic ASL Signs For Beginners',
      thumbnailUrl: 'https://img.youtube.com/vi/v1desDduz5M/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'Fp9Z8Xh5CQ0',
      title: 'Common ASL Phrases Every Beginner Should Know',
      thumbnailUrl: 'https://img.youtube.com/vi/Fp9Z8Xh5CQ0/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    },
    {
      videoId: 'dJBLF8Dx_R4',
      title: 'ASL Alphabet - Learn American Sign Language Letters',
      thumbnailUrl: 'https://img.youtube.com/vi/dJBLF8Dx_R4/maxresdefault.jpg',
      channelTitle: 'ASL Meredith'
    }
  ]
};

const getCuratedVideos = (query: string): RelatedVideo[] => {
  // Convert query to lowercase and remove special characters
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check for specific categories
  if (normalizedQuery.includes('alphabet') || normalizedQuery.includes('letter')) {
    return curatedVideos.alphabet;
  }
  if (normalizedQuery.includes('number') || normalizedQuery.includes('time')) {
    return curatedVideos.numbers;
  }
  if (normalizedQuery.includes('family') || normalizedQuery.includes('relationship')) {
    return curatedVideos.family;
  }
  if (normalizedQuery.includes('basic') || normalizedQuery.includes('beginner')) {
    return curatedVideos.basics;
  }
  
  return curatedVideos.default;
};

export const fetchRelatedVideos = async (query: string): Promise<RelatedVideo[]> => {
  // Always return curated videos for consistent experience
  return getCuratedVideos(query);
};