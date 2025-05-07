import { Pose } from '@tensorflow-models/pose-detection';

export interface EmotionResult {
  emotion: string;
  confidence: number;
  feedback: string;
  missingFeatures: string[];
}

// MediaPipe Face Mesh landmark indices
const FACE_LANDMARKS = {
  leftEyebrow: {
    inner: 336,
    outer: 296,
    top: 282,
    bottom: 276
  },
  rightEyebrow: {
    inner: 107,
    outer: 67,
    top: 52,
    bottom: 46
  },
  mouth: {
    top: 13,
    bottom: 14,
    left: 78,
    right: 308,
    leftCorner: 61,
    rightCorner: 291
  },
  nose: {
    tip: 1,
    bottom: 2
  },
  eyes: {
    leftOuter: 33,
    leftInner: 133,
    rightInner: 362,
    rightOuter: 263
  }
};

const emotionPatterns = {
  happy: {
    bodyPosture: {
      shouldersUp: true,
      headUp: true,
      armsOpen: true
    },
    facialFeatures: {
      mouthOpen: true,
      mouthUpturned: true,
      eyebrowsNeutral: true
    },
    feedback: {
      success: "Perfect! Your smile and open posture show happiness!",
      partial: "Almost there! Try to:",
      tips: {
        shouldersUp: "Lift your shoulders slightly",
        headUp: "Raise your head a bit more",
        armsOpen: "Keep your arms more relaxed and open",
        mouthOpen: "Open your mouth in a natural smile",
        mouthUpturned: "Turn up the corners of your mouth",
        eyebrowsNeutral: "Relax your eyebrows"
      }
    }
  },
  sad: {
    bodyPosture: {
      shouldersDown: true,
      headDown: true,
      armsClose: true
    },
    facialFeatures: {
      mouthDownturned: true,
      eyebrowsInnerUp: true,
      eyesNarrowed: true
    },
    feedback: {
      success: "Excellent! Your expression clearly shows sadness",
      partial: "Getting closer! Try to:",
      tips: {
        shouldersDown: "Drop your shoulders more",
        headDown: "Lower your head slightly",
        armsClose: "Keep your arms closer to your body",
        mouthDownturned: "Turn down the corners of your mouth more",
        eyebrowsInnerUp: "Raise the inner corners of your eyebrows",
        eyesNarrowed: "Slightly narrow your eyes"
      }
    }
  },
  angry: {
    bodyPosture: {
      shouldersTense: true,
      headForward: true,
      armsTense: true
    },
    facialFeatures: {
      eyebrowsFurrowed: true,
      eyesWide: true,
      mouthTight: true
    },
    feedback: {
      success: "Great job! Your angry expression is very clear",
      partial: "Keep working on it! Try to:",
      tips: {
        shouldersTense: "Tense your shoulders more",
        headForward: "Move your head slightly forward",
        armsTense: "Keep your arms tense",
        eyebrowsFurrowed: "Furrow your eyebrows more",
        eyesWide: "Open your eyes wider",
        mouthTight: "Press your lips together"
      }
    }
  }
};

const CONFIDENCE_THRESHOLD = 0.35;

export const recognizeEmotion = (poses: Pose[], faceLandmarks: any): EmotionResult | null => {
  try {
    if (!poses.length || !faceLandmarks?.length) {
      return {
        emotion: '',
        confidence: 0,
        feedback: 'Move closer to the camera and ensure your face and upper body are visible',
        missingFeatures: ['visibility']
      };
    }

    const pose = poses[0];
    const face = faceLandmarks[0];

    const bodyFeatures = analyzeBodyPosture(pose);
    const faceFeatures = analyzeFacialExpressions(face);

    let bestMatch: EmotionResult = { 
      emotion: '', 
      confidence: 0, 
      feedback: '',
      missingFeatures: []
    };

    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      const { bodyConfidence, missingBodyFeatures } = calculateBodyConfidence(bodyFeatures, pattern.bodyPosture);
      const { faceConfidence, missingFaceFeatures } = calculateFaceConfidence(faceFeatures, pattern.facialFeatures);
      
      // Weighted average with higher weight on facial expressions
      const confidence = (bodyConfidence * 0.3 + faceConfidence * 0.7);
      
      if (confidence > bestMatch.confidence) {
        const missingFeatures = [...missingBodyFeatures, ...missingFaceFeatures];
        const feedback = confidence > CONFIDENCE_THRESHOLD 
          ? pattern.feedback.success
          : pattern.feedback.partial + "\n" + 
            missingFeatures.map(feature => "• " + pattern.feedback.tips[feature]).join("\n");

        bestMatch = { 
          emotion, 
          confidence,
          feedback,
          missingFeatures
        };
      }
    });

    if (bestMatch.confidence > 0.2) {
      return bestMatch;
    }

    return {
      emotion: '',
      confidence: 0,
      feedback: 'Try to express your emotion more clearly. Make sure your face and upper body are visible.',
      missingFeatures: ['expression']
    };
  } catch (error) {
    console.error('Error in emotion recognition:', error);
    return null;
  }
};

const analyzeBodyPosture = (pose: Pose) => {
  const features = {
    shouldersUp: false,
    shouldersDown: false,
    shouldersTense: false,
    headUp: false,
    headDown: false,
    headForward: false,
    armsOpen: false,
    armsClose: false,
    armsTense: false
  };

  if (pose.keypoints) {
    const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
    const nose = pose.keypoints.find(kp => kp.name === 'nose');
    const leftElbow = pose.keypoints.find(kp => kp.name === 'left_elbow');
    const rightElbow = pose.keypoints.find(kp => kp.name === 'right_elbow');

    if (leftShoulder && rightShoulder && nose) {
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      features.shouldersUp = shoulderY < nose.y + 150;
      features.shouldersDown = shoulderY > nose.y + 180;
      
      features.headUp = nose.y < shoulderY - 80;
      features.headDown = nose.y > shoulderY - 40;
      features.headForward = nose.x > (leftShoulder.x + rightShoulder.x) / 2 + 20;
    }

    if (leftElbow && rightElbow && leftShoulder && rightShoulder) {
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
      const elbowWidth = Math.abs(rightElbow.x - leftElbow.x);
      
      features.armsOpen = elbowWidth > shoulderWidth * 1.3;
      features.armsClose = elbowWidth < shoulderWidth;
      features.armsTense = Math.abs(leftElbow.y - leftShoulder.y) < 60 || 
                          Math.abs(rightElbow.y - rightShoulder.y) < 60;
    }
  }

  return features;
};

const analyzeFacialExpressions = (face: any) => {
  const features = {
    mouthOpen: false,
    mouthUpturned: false,
    mouthDownturned: false,
    mouthTight: false,
    eyebrowsNeutral: false,
    eyebrowsInnerUp: false,
    eyebrowsFurrowed: false,
    eyesWide: false,
    eyesNarrowed: false
  };

  if (face?.keypoints) {
    // Get mouth measurements
    const mouthTop = face.keypoints[FACE_LANDMARKS.mouth.top];
    const mouthBottom = face.keypoints[FACE_LANDMARKS.mouth.bottom];
    const mouthLeft = face.keypoints[FACE_LANDMARKS.mouth.leftCorner];
    const mouthRight = face.keypoints[FACE_LANDMARKS.mouth.rightCorner];

    if (mouthTop && mouthBottom && mouthLeft && mouthRight) {
      // Vertical mouth opening
      const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
      features.mouthOpen = mouthHeight > 10;
      features.mouthTight = mouthHeight < 5;

      // Mouth corners angle for smile/frown detection
      const mouthAngle = Math.atan2(
        mouthRight.y - mouthLeft.y,
        mouthRight.x - mouthLeft.x
      );
      features.mouthUpturned = mouthAngle > 0.1;
      features.mouthDownturned = mouthAngle < -0.1;
    }

    // Get eyebrow measurements
    const leftEyebrowInner = face.keypoints[FACE_LANDMARKS.leftEyebrow.inner];
    const leftEyebrowOuter = face.keypoints[FACE_LANDMARKS.leftEyebrow.outer];
    const rightEyebrowInner = face.keypoints[FACE_LANDMARKS.rightEyebrow.inner];
    const rightEyebrowOuter = face.keypoints[FACE_LANDMARKS.rightEyebrow.outer];

    if (leftEyebrowInner && leftEyebrowOuter && rightEyebrowInner && rightEyebrowOuter) {
      // Measure eyebrow angles and positions
      const leftEyebrowAngle = Math.atan2(
        leftEyebrowOuter.y - leftEyebrowInner.y,
        leftEyebrowOuter.x - leftEyebrowInner.x
      );
      const rightEyebrowAngle = Math.atan2(
        rightEyebrowOuter.y - rightEyebrowInner.y,
        rightEyebrowOuter.x - rightEyebrowInner.x
      );

      features.eyebrowsFurrowed = Math.abs(leftEyebrowAngle - rightEyebrowAngle) > 0.2;
      features.eyebrowsInnerUp = (leftEyebrowInner.y < leftEyebrowOuter.y) && 
                                (rightEyebrowInner.y < rightEyebrowOuter.y);
      features.eyebrowsNeutral = Math.abs(leftEyebrowAngle) < 0.1 && 
                                Math.abs(rightEyebrowAngle) < 0.1;
    }

    // Get eye measurements
    const leftEyeInner = face.keypoints[FACE_LANDMARKS.eyes.leftInner];
    const leftEyeOuter = face.keypoints[FACE_LANDMARKS.eyes.leftOuter];
    const rightEyeInner = face.keypoints[FACE_LANDMARKS.eyes.rightInner];
    const rightEyeOuter = face.keypoints[FACE_LANDMARKS.eyes.rightOuter];

    if (leftEyeInner && leftEyeOuter && rightEyeInner && rightEyeOuter) {
      const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
      const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x);
      const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;

      features.eyesWide = avgEyeWidth > 30;
      features.eyesNarrowed = avgEyeWidth < 20;
    }
  }

  return features;
};

const calculateBodyConfidence = (features: any, pattern: any): { bodyConfidence: number; missingBodyFeatures: string[] } => {
  let matches = 0;
  let total = 0;
  const missingBodyFeatures: string[] = [];

  Object.entries(pattern).forEach(([key, value]) => {
    if (features[key] === value) {
      matches++;
    } else {
      missingBodyFeatures.push(key);
    }
    total++;
  });

  return {
    bodyConfidence: total > 0 ? matches / total : 0,
    missingBodyFeatures
  };
};

const calculateFaceConfidence = (features: any, pattern: any): { faceConfidence: number; missingFaceFeatures: string[] } => {
  let matches = 0;
  let total = 0;
  const missingFaceFeatures: string[] = [];

  Object.entries(pattern).forEach(([key, value]) => {
    if (features[key] === value) {
      matches++;
    } else {
      missingFaceFeatures.push(key);
    }
    total++;
  });

  return {
    faceConfidence: total > 0 ? matches / total : 0,
    missingFaceFeatures
  };
};