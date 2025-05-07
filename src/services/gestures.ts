import * as tf from '@tensorflow/tfjs';
import { Coords3D } from '@tensorflow-models/handpose/dist/types';

export interface GestureResult {
  name: string;
  confidence: number;
}

// Comprehensive gesture patterns for ASL letters
const gesturePatterns = {
  A: {
    pattern: [
      [0, 0, 0], // thumb position
      [1, 0, 0], // index finger (closed)
      [1, 0, 0], // middle finger (closed)
      [1, 0, 0], // ring finger (closed)
      [1, 0, 0]  // pinky (closed)
    ]
  },
  B: {
    pattern: [
      [0, 1, 0], // thumb (tucked)
      [1, 1, 0], // index finger (straight up)
      [1, 1, 0], // middle finger (straight up)
      [1, 1, 0], // ring finger (straight up)
      [1, 1, 0]  // pinky (straight up)
    ]
  },
  C: {
    pattern: [
      [1, 1, 1], // thumb (curved)
      [1, 1, 1], // index finger (curved)
      [1, 1, 1], // middle finger (curved)
      [1, 1, 1], // ring finger (curved)
      [1, 1, 1]  // pinky (curved)
    ]
  },
  D: {
    pattern: [
      [0, 1, 0], // thumb (tucked)
      [1, 1, 0], // index finger (straight up)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  E: {
    pattern: [
      [1, 0, 0], // thumb (bent)
      [1, 0, 0], // index finger (bent)
      [1, 0, 0], // middle finger (bent)
      [1, 0, 0], // ring finger (bent)
      [1, 0, 0]  // pinky (bent)
    ]
  },
  F: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 0, 1], // index finger (touching thumb)
      [1, 1, 0], // middle finger (straight)
      [1, 1, 0], // ring finger (straight)
      [1, 1, 0]  // pinky (straight)
    ]
  },
  G: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (pointing)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  H: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (straight)
      [1, 1, 0], // middle finger (straight)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  I: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [0, 0, 0], // index finger (closed)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [1, 1, 0]  // pinky (extended)
    ]
  },
  J: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [0, 0, 0], // index finger (closed)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [1, 1, 1]  // pinky (extended and curved)
    ]
  },
  K: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (straight up)
      [1, 1, 1], // middle finger (angled)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  L: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (straight up)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  M: {
    pattern: [
      [0, 0, 1], // thumb (between fingers)
      [1, 0, 0], // index finger (closed)
      [1, 0, 0], // middle finger (closed)
      [1, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  N: {
    pattern: [
      [0, 0, 1], // thumb (between fingers)
      [1, 0, 0], // index finger (closed)
      [1, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  O: {
    pattern: [
      [1, 1, 1], // thumb (curved)
      [1, 1, 1], // index finger (curved)
      [1, 1, 1], // middle finger (curved)
      [1, 1, 1], // ring finger (curved)
      [1, 1, 1]  // pinky (curved)
    ]
  },
  P: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (pointing down)
      [1, 1, 0], // middle finger (pointing down)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  Q: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 1, 0], // index finger (pointing down)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  R: {
    pattern: [
      [0, 0, 1], // thumb (crossed)
      [1, 1, 0], // index finger (crossed)
      [1, 1, 0], // middle finger (straight)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  S: {
    pattern: [
      [1, 0, 0], // thumb (wrapped)
      [1, 0, 0], // index finger (closed)
      [1, 0, 0], // middle finger (closed)
      [1, 0, 0], // ring finger (closed)
      [1, 0, 0]  // pinky (closed)
    ]
  },
  T: {
    pattern: [
      [0, 0, 1], // thumb (between fingers)
      [1, 0, 0], // index finger (closed)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  U: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [1, 1, 0], // index finger (straight)
      [1, 1, 0], // middle finger (straight)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  V: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [1, 1, 0], // index finger (straight)
      [1, 1, 0], // middle finger (straight spread)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  W: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [1, 1, 0], // index finger (straight)
      [1, 1, 0], // middle finger (straight)
      [1, 1, 0], // ring finger (straight)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  X: {
    pattern: [
      [0, 0, 0], // thumb (closed)
      [1, 0, 1], // index finger (hooked)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  },
  Y: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [0, 0, 0], // index finger (closed)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [1, 1, 0]  // pinky (extended)
    ]
  },
  Z: {
    pattern: [
      [1, 1, 0], // thumb (extended)
      [1, 0, 1], // index finger (pointing)
      [0, 0, 0], // middle finger (closed)
      [0, 0, 0], // ring finger (closed)
      [0, 0, 0]  // pinky (closed)
    ]
  }
};

const CONFIDENCE_THRESHOLD = 0.65;
const MIN_HAND_SIZE = 50;
const DETECTION_STABILITY_FRAMES = 3;
const MAX_HISTORY_LENGTH = 10;

let gestureHistory: string[] = [];
let lastConfidentGesture: string | null = null;
let stableFrameCount = 0;

export const recognizeGesture = (landmarks: number[][]): GestureResult | null => {
  try {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    // Calculate hand size and check if it's too small
    const handSize = calculateHandSize(landmarks);
    if (handSize < MIN_HAND_SIZE) {
      return null;
    }

    // Normalize landmarks
    const normalizedLandmarks = normalizeLandmarks(landmarks);
    
    // Compare with patterns
    let bestMatch: GestureResult = { name: '', confidence: 0 };
    
    Object.entries(gesturePatterns).forEach(([gesture, { pattern }]) => {
      const confidence = calculateConfidence(normalizedLandmarks, pattern);
      if (confidence > bestMatch.confidence) {
        bestMatch = { name: gesture, confidence };
      }
    });

    // Update gesture history
    gestureHistory.push(bestMatch.name);
    if (gestureHistory.length > MAX_HISTORY_LENGTH) {
      gestureHistory.shift();
    }

    // Check for stable detection
    const isStableDetection = gestureHistory
      .slice(-DETECTION_STABILITY_FRAMES)
      .every(g => g === bestMatch.name);
    
    if (isStableDetection && bestMatch.confidence > CONFIDENCE_THRESHOLD) {
      stableFrameCount++;
      if (stableFrameCount >= DETECTION_STABILITY_FRAMES && bestMatch.name !== lastConfidentGesture) {
        lastConfidentGesture = bestMatch.name;
        stableFrameCount = 0;
        return bestMatch;
      }
    } else {
      stableFrameCount = 0;
    }

    return null;
  } catch (error) {
    console.error('Error in gesture recognition:', error);
    return null;
  }
};

export const resetGestureDetection = () => {
  gestureHistory = [];
  lastConfidentGesture = null;
  stableFrameCount = 0;
};

const normalizeLandmarks = (landmarks: number[][]): number[][] => {
  const palmCenter = landmarks[0];
  const handSize = calculateHandSize(landmarks);
  
  return landmarks.map(point => [
    (point[0] - palmCenter[0]) / handSize,
    (point[1] - palmCenter[1]) / handSize,
    (point[2] - palmCenter[2]) / handSize
  ]);
};

const calculateHandSize = (landmarks: number[][]): number => {
  const xs = landmarks.map(l => l[0]);
  const ys = landmarks.map(l => l[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return Math.max(1, Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)));
};

const calculateConfidence = (landmarks: number[][], pattern: number[][]): number => {
  let totalDifference = 0;
  let pointsCompared = 0;
  
  landmarks.forEach((landmark, i) => {
    if (pattern[i]) {
      const diff = landmark.reduce((acc, val, j) => {
        return acc + Math.abs(val - pattern[i][j]);
      }, 0);
      totalDifference += diff;
      pointsCompared++;
    }
  });
  
  const avgDifference = totalDifference / (pointsCompared * 3);
  return 1 / (1 + avgDifference);
};