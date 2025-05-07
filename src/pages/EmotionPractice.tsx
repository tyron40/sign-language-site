import React, { useState } from 'react';
import { BodyDetection } from '../components/BodyDetection';
import { recognizeEmotion } from '../services/emotions';
import { Award, RefreshCw, Camera, AlertCircle } from 'lucide-react';

const EmotionPractice = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [currentEmotion, setCurrentEmotion] = useState<string>('happy');
  const [score, setScore] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [detectionStatus, setDetectionStatus] = useState<'waiting' | 'detecting' | 'success'>('waiting');

  const emotions = ['happy', 'sad', 'angry'];

  const handlePoseDetected = (poses: any[], faces: any) => {
    const result = recognizeEmotion(poses, faces);
    
    if (result) {
      setDetectionStatus('detecting');
      
      if (result.emotion === currentEmotion && result.confidence > 0.4) {
        setShowSuccess(true);
        setDetectionStatus('success');
        setFeedback(result.feedback);
        setConsecutiveCorrect(prev => prev + 1);
        setScore(prev => prev + 10);
        
        setTimeout(() => {
          const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)];
          setCurrentEmotion(nextEmotion);
          setShowSuccess(false);
          setDetectionStatus('waiting');
        }, 2000);
      } else if (result.emotion === '') {
        setFeedback(result.feedback);
        setConsecutiveCorrect(0);
      } else {
        setFeedback(result.feedback);
        setConsecutiveCorrect(0);
      }
    } else {
      setDetectionStatus('waiting');
      setFeedback('Move closer to the camera and ensure good lighting');
    }
  };

  const resetProgress = () => {
    setScore(0);
    setConsecutiveCorrect(0);
    setCurrentEmotion('happy');
    setShowSuccess(false);
    setFeedback('');
    setDetectionStatus('waiting');
  };

  const getFeedbackColor = () => {
    switch (detectionStatus) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'detecting':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Practice Emotional Expressions
        </h1>
        <p className="text-xl text-gray-600">
          Learn to express emotions through facial expressions and body language
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Camera Feed</h2>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Make sure your face and upper body are visible</span>
              </div>
            </div>
            <BodyDetection onPoseDetected={handlePoseDetected} showSkeleton={true} />
            <div className={`mt-4 p-4 rounded-md ${getFeedbackColor()}`}>
              <div className="whitespace-pre-line">{feedback}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Current Task</h2>
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-400" />
                <span className="text-lg font-semibold">{score} pts</span>
              </div>
            </div>
            
            <div className="text-center py-8 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600 mb-2">
                Express this emotion
              </p>
              <p className="text-4xl font-bold text-indigo-600 capitalize mb-4">{currentEmotion}</p>
              <div className="mt-4 flex justify-center">
                <img 
                  src={`/images/asl/emotions/${currentEmotion}.png`}
                  alt={`${currentEmotion} expression`}
                  className="h-48 object-contain"
                />
              </div>
            </div>

            {consecutiveCorrect > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-green-600">
                  {consecutiveCorrect} correct in a row!
                </p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Reference Guide</h3>
              <div className="grid grid-cols-3 gap-2">
                {emotions.map(emotion => (
                  <div
                    key={emotion}
                    className={`p-3 rounded-lg ${
                      emotion === currentEmotion
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <img 
                        src={`/images/asl/emotions/${emotion}.png`}
                        alt={`${emotion} expression`}
                        className="h-16 mx-auto mb-2"
                      />
                      <div className="text-lg font-bold capitalize">{emotion}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={resetProgress}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Progress
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips for Success</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Positioning</h3>
                <ul className="text-gray-600 text-sm list-disc pl-4 space-y-1">
                  <li>Position yourself about 2-3 feet from the camera</li>
                  <li>Ensure your face and upper body are clearly visible</li>
                  <li>Make sure you have good lighting on your face</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Expression Tips</h3>
                <ul className="text-gray-600 text-sm list-disc pl-4 space-y-1">
                  <li>Make your expressions clear and pronounced</li>
                  <li>Include both facial expressions and body language</li>
                  <li>Hold your expression steady for better detection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionPractice;