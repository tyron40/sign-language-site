import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../services/courses';
import { fetchRelatedVideos } from '../services/youtube';
import { Course, Lesson, RelatedVideo } from '../types';
import { HandDetection } from '../components/HandDetection';
import { VideoModal } from '../components/VideoModal';
import { Play, Book, Video } from 'lucide-react';

export const CourseLesson = () => {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'practice'>('video');
  const [selectedVideo, setSelectedVideo] = useState<RelatedVideo | null>(null);

  // Get the current origin for the embed URL
  const origin = window.location.origin;
  
  // Construct the embed URL with all necessary parameters
  const mainVideoUrl = currentLesson ? `https://www.youtube.com/embed/${currentLesson.videoId}?` + new URLSearchParams({
    origin,
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    fs: '1',
    controls: '1'
  }).toString() : '';

  useEffect(() => {
    const loadCourseAndLesson = async () => {
      if (!courseId || !lessonId) return;

      try {
        const fetchedCourse = await getCourseById(courseId);
        if (fetchedCourse) {
          setCourse(fetchedCourse);
          const lesson = fetchedCourse.lessons.find(l => l.id === lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
            const videos = await fetchRelatedVideos(lesson.title);
            setRelatedVideos(videos);
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseAndLesson();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
          <p className="text-gray-600">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{currentLesson.title}</h1>
        <p className="mt-2 text-gray-600">{currentLesson.description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'video'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('video')}
              >
                <Video className="inline-block w-4 h-4 mr-2" />
                Video Lesson
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'practice'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('practice')}
              >
                <Play className="inline-block w-4 h-4 mr-2" />
                Practice
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'video' ? (
                <div className="relative w-full aspect-video">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={mainVideoUrl}
                    title={currentLesson.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div>
                  <HandDetection
                    onHandPoseDetected={(landmarks) => {
                      console.log('Hand pose detected:', landmarks);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Videos</h2>
            <div className="space-y-4">
              {relatedVideos.map((video) => (
                <div
                  key={video.videoId}
                  className="flex space-x-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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