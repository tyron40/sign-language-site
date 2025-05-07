import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@mediapipe/pose';
import '@mediapipe/face_mesh';
import { Camera, RefreshCw, Video, VideoOff } from 'lucide-react';

interface Props {
  onPoseDetected: (pose: poseDetection.Pose[], face: any) => void;
  showSkeleton?: boolean;
}

export const BodyDetection: React.FC<Props> = ({ onPoseDetected, showSkeleton = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [poseDetector, setPoseDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [faceDetector, setFaceDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

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
          frameRate: { ideal: 30 }
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

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D, 
    poses: poseDetection.Pose[], 
    faceLandmarks: any
  ) => {
    // Draw pose keypoints
    poses.forEach(pose => {
      if (pose.keypoints) {
        // Draw pose connections
        const connections = poseDetection.util.getAdjacentPairs('mediapipe-pose');
        connections.forEach(([i, j]) => {
          const kp1 = pose.keypoints[i];
          const kp2 = pose.keypoints[j];

          if (kp1.score && kp2.score && kp1.score > 0.3 && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });

        // Draw pose points
        pose.keypoints.forEach(keypoint => {
          if (keypoint.score && keypoint.score > 0.3) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fill();
          }
        });
      }
    });

    // Draw face landmarks with connections
    if (faceLandmarks && faceLandmarks.length > 0) {
      const face = faceLandmarks[0];
      
      // Draw all face landmarks
      face.keypoints.forEach((keypoint: any, index: number) => {
        // Different colors for different facial features
        let color = 'rgba(0, 255, 0, 0.7)'; // Default green for most points

        // Eyebrows (purple)
        if ((index >= 336 && index <= 296) || (index >= 107 && index <= 67)) {
          color = 'rgba(128, 0, 128, 0.7)';
        }
        // Eyes (blue)
        else if ((index >= 33 && index <= 133) || (index >= 362 && index <= 263)) {
          color = 'rgba(0, 0, 255, 0.7)';
        }
        // Mouth (red)
        else if ((index >= 61 && index <= 291) || (index >= 13 && index <= 14)) {
          color = 'rgba(255, 0, 0, 0.7)';
        }

        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw connections for facial features
      const drawConnection = (point1: number, point2: number) => {
        const start = face.keypoints[point1];
        const end = face.keypoints[point2];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };

      // Draw mouth connections
      [
        [61, 291], // Mouth corners
        [61, 13],  // Left side
        [291, 13], // Right side
        [13, 14]   // Top to bottom
      ].forEach(([start, end]) => drawConnection(start, end));

      // Draw eyebrow connections
      [
        [336, 296], // Left eyebrow
        [107, 67]   // Right eyebrow
      ].forEach(([start, end]) => drawConnection(start, end));

      // Draw eye connections
      [
        [33, 133],  // Left eye
        [362, 263]  // Right eye
      ].forEach(([start, end]) => drawConnection(start, end));
    }
  };

  const initTensorFlow = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await tf.setBackend('webgl');
      await tf.ready();

      await startCamera();

      // Initialize pose detector with higher accuracy settings
      const poseModel = poseDetection.SupportedModels.BlazePose;
      const poseDetectorConfig = {
        runtime: 'mediapipe',
        modelType: 'full',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
        enableSmoothing: true
      };
      const detector = await poseDetection.createDetector(poseModel, poseDetectorConfig);
      setPoseDetector(detector);

      // Initialize face detector with refined settings
      const faceModel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const faceDetectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 1
      };
      const faceDetector = await faceLandmarksDetection.createDetector(
        faceModel, 
        faceDetectorConfig
      );
      setFaceDetector(faceDetector);

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to initialize body detection';
      setError(errorMessage);
      setIsLoading(false);
      stopCamera();
      throw err;
    }
  };

  const detect = async () => {
    const video = videoRef.current;
    if (!poseDetector || !faceDetector || !video || !canvasRef.current || error || !isCameraOn) return;

    try {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Get predictions
        const poses = await poseDetector.estimatePoses(video, {
          flipHorizontal: false
        });
        const faces = await faceDetector.estimateFaces(video, {
          flipHorizontal: false
        });
        
        const ctx = canvasRef.current.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw video
          ctx.drawImage(
            video,
            0, 0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          
          if (showSkeleton) {
            drawSkeleton(ctx, poses, faces);
          }

          // Send detection results
          onPoseDetected(poses, faces);
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
    if (poseDetector && faceDetector && !error && isCameraOn) {
      requestRef.current = requestAnimationFrame(detect);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [poseDetector, faceDetector, error, isCameraOn]);

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
          {isCameraOn ? 'Camera is active. Show your expressions and poses!' : 'Turn on camera to start practicing'}
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
              <p className="mt-4 text-white">Initializing camera and AI models...</p>
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