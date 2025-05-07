import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Video, BookOpen, Heart } from 'lucide-react';

export const Courses = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Learn American Sign Language Practically
      </h1>

      {/* Top Section - Video Courses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link 
          to="/phrases"
          className="bg-pink-100 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Phrases Dictionary</h2>
              <p className="text-gray-700 mb-4">
                English-American Sign Language dictionary contains video for over 100,000 words.
              </p>
            </div>
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse video lessons
          </div>
        </Link>

        <Link 
          to="/emotions"
          className="bg-purple-100 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Emotion Recognition</h2>
              <p className="text-gray-700 mb-4">
                Practice expressing emotions through facial expressions and body language.
              </p>
            </div>
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex items-center">
            <Play className="w-4 h-4 mr-2" />
            Practice emotions
          </div>
        </Link>

        <Link 
          to="/alphabet-songs"
          className="bg-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Alphabet Songs</h2>
              <p className="text-gray-700 mb-4">
                Learn alphabets through songs from Jack Hartmann Kids Music Channel
              </p>
            </div>
            <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
              <img 
                src="https://raw.githubusercontent.com/Narottam04/SignLanguage/master/frontend/src/assets/HandSign.png"
                alt="Hand Sign"
                className="w-full h-full"
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex items-center">
            <Play className="w-4 h-4 mr-2" />
            Watch alphabet songs
          </div>
        </Link>
      </div>

      {/* ASL Basic Curriculum - Practice Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ASL Basic Curriculum</h2>
        <p className="text-gray-600 mb-8">
          Practice ASL with our interactive lessons using AI-powered hand detection technology
        </p>
        
        {/* Numbers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/practice?mode=numbers" className="bg-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Learn Numbers</h3>
            <p className="text-gray-700 mb-4">
              Learn numbers from 0-10 in chronological order with the help of artificial intelligence.
            </p>
            <div className="flex justify-end">
              <img 
                src="https://raw.githubusercontent.com/Narottam04/SignLanguage/master/frontend/src/assets/HandSign.png"
                alt="Hand Sign"
                className="w-20 h-20"
              />
            </div>
          </Link>

          <Link to="/practice?mode=numbers-quiz" className="bg-blue-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Random Numbers Quiz</h3>
            <p className="text-gray-700 mb-4">
              Show your hands on screen and AI will try to predict the numbers from 0-10 based on your hand signs.
            </p>
            <div className="flex justify-end">
              <img 
                src="https://raw.githubusercontent.com/Narottam04/SignLanguage/master/frontend/src/assets/HandSign.png"
                alt="Hand Sign"
                className="w-20 h-20"
              />
            </div>
          </Link>
        </div>

        {/* Alphabets Sections */}
        {[
          { range: 'A-F', color: 'emerald', bgLight: 'bg-emerald-100', bgDark: 'bg-emerald-200' },
          { range: 'G-K', color: 'orange', bgLight: 'bg-orange-100', bgDark: 'bg-orange-200' },
          { range: 'L-P', color: 'yellow', bgLight: 'bg-yellow-100', bgDark: 'bg-yellow-200' },
          { range: 'Q-U', color: 'green', bgLight: 'bg-green-100', bgDark: 'bg-green-200' },
          { range: 'V-Z', color: 'pink', bgLight: 'bg-pink-100', bgDark: 'bg-pink-200' }
        ].map(({ range, bgLight, bgDark }) => (
          <div key={range} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Link 
              to={`/practice?mode=learn&range=${range.toLowerCase()}`}
              className={`${bgLight} rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <h3 className="text-lg font-semibold mb-2">Learn Alphabets {range}</h3>
              <p className="text-gray-700 mb-4">
                Learn alphabets from {range} in chronological order with the help of artificial intelligence.
              </p>
              <div className="flex justify-end">
                <div className="text-4xl font-bold">{range}</div>
              </div>
            </Link>

            <Link 
              to={`/practice?mode=quiz&range=${range.toLowerCase()}`}
              className={`${bgDark} rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <h3 className="text-lg font-semibold mb-2">Alphabets Quiz {range}</h3>
              <p className="text-gray-700 mb-4">
                Learn alphabets from {range} in random order with the help of artificial intelligence quiz.
              </p>
              <div className="flex justify-end">
                <Play className="w-12 h-12" />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};