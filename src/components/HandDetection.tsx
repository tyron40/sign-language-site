import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { Camera, RefreshCw, Video, VideoOff } from 'lucide-react';

interface Props {
  onHandPoseDetected: (landmarks: number[][]) => void;
  showSkeleton?: boolean;
}

export const HandDetection: React.FC<Props> = ({ onHandPoseDetected, showSkeleton = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  // Finger pairs for skeleton drawing
  const fingerPairs = [
    [0, 1], [1, 2], [2, 3], [3, 4], // thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
    [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    [0, 5], [5, 9], [9, 13], [13, 17] // palm
  ];

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsCameraOn(false);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 60 }
        }
      });

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      streamRef.current = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve);
        };
      });

      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }

      setIsCameraOn(true);
      return true;
    } catch (err) {
      let errorMessage = 'Failed to initialize camera';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access was denied. Please allow camera access and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application. Please close other applications using the camera.';
        }
      }

      throw new Error(errorMessage);
    }
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: number[][]) => {
    // Draw connections
    fingerPairs.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[start][0], landmarks[start][1]);
      ctx.lineTo(landmarks[end][0], landmarks[end][1]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw landmarks
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const initTensorFlow = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await tf.setBackend('webgl');
      await tf.ready();

      await startCamera();

      const loadedModel = await handpose.load({
        maxContinuousChecks: 1,
        detectionConfidence: 0.8,
        iouThreshold: 0.3,
        scoreThreshold: 0.75
      });

      setModel(loadedModel);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to initialize hand detection';
      setError(errorMessage);
      setIsLoading(false);
      stopCamera();
      throw err;
    }
  };

  const detect = async () => {
    const video = videoRef.current;
    if (!model || !video || !canvasRef.current || error || !isCameraOn) return;

    try {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const predictions = await model.estimateHands(video);
        const ctx = canvasRef.current.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw video without mirroring
          ctx.drawImage(
            video,
            0, 0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          
          if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            // Use landmarks directly without transformation
            onHandPoseDetected(landmarks);
            
            if (showSkeleton) {
              drawSkeleton(ctx, landmarks);
            }
          }
        }
      }
    } catch (err) {
      console.debug('Detection error:', err);
    }

    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (model && !error && isCameraOn) {
      requestRef.current = requestAnimationFrame(detect);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [model, error, isCameraOn]);

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      initTensorFlow();
    }
  };

  if (error) {
    return (
      <div className="relative rounded-lg bg-gray-50 p-8 text-center">
        <div className="mb-4">
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            initTensorFlow();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {isCameraOn ? 'Camera is active. Show your hand signs!' : 'Turn on camera to start practicing'}
        </p>
        <button
          onClick={toggleCamera}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isCameraOn 
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Initializing...
            </>
          ) : isCameraOn ? (
            <>
              <VideoOff className="h-4 w-4 mr-2" />
              Turn Off Camera
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Turn On Camera
            </>
          )}
        </button>
      </div>

      <div className="relative w-full h-[480px] mx-auto rounded-lg overflow-hidden bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-white">Initializing camera and AI model...</p>
              <p className="mt-2 text-sm text-gray-300">Please allow camera access when prompted</p>
            </div>
          </div>
        )}

        {!isCameraOn && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Camera className="mx-auto h-12 w-12 mb-4" />
              <p>Click the button above to start your camera</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            !isCameraOn && 'hidden'
          }`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${!isCameraOn && 'hidden'}`}
        />
      </div>
    </div>
  );
};