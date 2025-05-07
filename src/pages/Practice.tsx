import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HandDetection } from '../components/HandDetection';
import { recognizeGesture, resetGestureDetection } from '../services/gestures';
import { Award, HandMetal, RefreshCw, Camera, Volume2, VolumeX, RotateCcw, ChevronRight } from 'lucide-react';

export const Practice = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'learn';
  const range = searchParams.get('range')?.toLowerCase() || 'a-f';

  const [feedback, setFeedback] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [practiceMode, setPracticeMode] = useState<'learn' | 'quiz'>('learn');
  const [progress, setProgress] = useState<Record<string, number>>({});

  // Determine category and items based on mode
  const getCategory = () => {
    if (mode.includes('number')) return 'numbers';
    return 'alphabet';
  };

  const getItems = () => {
    const category = getCategory();
    if (category === 'numbers') {
      return ['0', '1', '2', '3', '4', '5'];
    }
    // For alphabet, parse the range
    const [start, end] = range.split('-');
    const items = [];
    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
      items.push(String.fromCharCode(i).toUpperCase());
    }
    return items;
  };

  const items = getItems();
  const category = getCategory();

  useEffect(() => {
    if (!currentItem && items.length > 0) {
      setCurrentItem(items[0]);
    }
  }, [items]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`aslProgress_${category}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [category]);

  const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/correct-answer-tone.wav');
  const errorSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/wrong-answer-buzz.wav');

  const playSound = (correct: boolean) => {
    if (!soundEnabled) return;
    if (correct) {
      successSound.play().catch(() => {});
    } else {
      errorSound.play().catch(() => {});
    }
  };

  const handleHandPoseDetected = (landmarks: number[][]) => {
    if (landmarks.length > 0) {
      const result = recognizeGesture(landmarks);
      if (result && result.name === currentItem) {
        playSound(true);
        setShowSuccess(true);
        setFeedback(`Correct! That's ${category === 'numbers' ? 'number' : 'letter'} ${currentItem}`);
        setConsecutiveCorrect(prev => prev + 1);
        setScore(prev => prev + 10);
        
        // Only update progress once per letter
        if (!progress[currentItem]) {
          const newProgress = {
            ...progress,
            [currentItem]: 1
          };
          setProgress(newProgress);
          localStorage.setItem(`aslProgress_${category}`, JSON.stringify(newProgress));
        }
        
        // Move to next item after a short delay
        setTimeout(() => {
          if (practiceMode === 'quiz') {
            // In quiz mode, pick a random item that hasn't been completed yet
            const uncompletedItems = items.filter(item => !progress[item]);
            if (uncompletedItems.length > 0) {
              const randomIndex = Math.floor(Math.random() * uncompletedItems.length);
              setCurrentItem(uncompletedItems[randomIndex]);
            } else {
              // All items completed, reset progress
              setProgress({});
              localStorage.setItem(`aslProgress_${category}`, JSON.stringify({}));
              const randomIndex = Math.floor(Math.random() * items.length);
              setCurrentItem(items[randomIndex]);
            }
          } else {
            // In learn mode, move to the next item in sequence
            const currentIndex = items.indexOf(currentItem);
            const nextIndex = (currentIndex + 1) % items.length;
            setCurrentItem(items[nextIndex]);
          }
          setShowSuccess(false);
          resetGestureDetection(); // Reset gesture detection state for the new letter
        }, 1500);
      } else if (result) {
        // If a gesture is detected but it's wrong
        playSound(false);
        setFeedback(`That looks like ${result.name}. Try adjusting your hand position for ${currentItem}.`);
        setConsecutiveCorrect(0);
      } else {
        setFeedback('Keep trying! Make sure your hand is clearly visible.');
      }
    } else {
      setFeedback('No hand detected. Please position your hand in front of the camera.');
    }
  };

  const resetProgress = () => {
    setScore(0);
    setConsecutiveCorrect(0);
    setCurrentItem(items[0]);
    setShowSuccess(false);
    setFeedback('');
  };

  const toggleMode = () => {
    setPracticeMode(prev => prev === 'learn' ? 'quiz' : 'learn');
    resetProgress();
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Practice {category === 'numbers' ? 'Numbers' : 'Alphabet'}
        </h1>
        <p className="mt-2 max-w-2xl mx-auto text-xl text-gray-500">
          Practice your sign language skills with real-time feedback
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Camera Feed</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2 className="h-6 w-6 text-gray-600" /> : <VolumeX className="h-6 w-6 text-gray-400" />}
                </button>
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <HandDetection onHandPoseDetected={handleHandPoseDetected} showSkeleton={true} />
            <div className={`mt-4 p-4 rounded-md ${showSuccess ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
              <p>{feedback}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Current Task</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleMode}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                >
                  {practiceMode === 'learn' ? 'Switch to Quiz' : 'Switch to Learn'}
                </button>
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <span className="text-lg font-semibold">{score} pts</span>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600 mb-2">
                Sign the {category === 'numbers' ? 'number' : 'letter'}
              </p>
              <p className="text-6xl font-bold text-indigo-600">{currentItem}</p>
              <div className="mt-4 flex justify-center">
                <img 
                  src={`/images/asl/${category}/${currentItem}.png`}
                  alt={`${category === 'numbers' ? 'Number' : 'Letter'} ${currentItem} sign`}
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
                {items.map(item => (
                  <div
                    key={item}
                    className={`p-3 rounded-lg ${
                      item === currentItem
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <img 
                        src={`/images/asl/${category}/${item}.png`}
                        alt={`${category === 'numbers' ? 'Number' : 'Letter'} ${item} sign`}
                        className="h-16 mx-auto mb-2"
                      />
                      <div className="text-xl font-bold">{item}</div>
                      <div className="text-sm text-gray-600">
                        {progress[item] || 0} correct
                      </div>
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
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <HandMetal className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-medium">Position your hand</p>
                  <p className="text-gray-600 text-sm">Keep your hand clearly visible in front of the camera</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RefreshCw className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-medium">Practice the sign</p>
                  <p className="text-gray-600 text-sm">Match your hand position to the shown {category === 'numbers' ? 'number' : 'letter'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ChevronRight className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-medium">{practiceMode === 'learn' ? 'Learning Mode' : 'Quiz Mode'}</p>
                  <p className="text-gray-600 text-sm">
                    {practiceMode === 'learn' 
                      ? `${category === 'numbers' ? 'Numbers' : 'Letters'} appear in sequence for structured learning` 
                      : `Random ${category === 'numbers' ? 'numbers' : 'letters'} to test your knowledge`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};