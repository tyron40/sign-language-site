import { Course, Lesson } from '../types';

// Sample course data with videos from ASL Meredith's channel
const sampleCourses = [
  {
    id: '1',
    title: "ASL Alphabet Mastery",
    description: "Learn to fingerspell and master the ASL alphabet with interactive lessons and practice sessions",
    level: "Beginner",
    order: 1,
    imageUrl: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        id: '1-1',
        title: "Introduction to Fingerspelling",
        description: "Learn the basics of fingerspelling and its importance in ASL",
        videoId: "dJBLF8Dx_R4",
        order: 1
      },
      {
        id: '1-2',
        title: "Letters A-J Practice",
        description: "Master the first ten letters of the ASL alphabet",
        videoId: "6_gXiBe9y9Y",
        order: 2
      },
      {
        id: '1-3',
        title: "Letters K-T Practice",
        description: "Learn the next ten letters of the ASL alphabet",
        videoId: "zWvnGRYH3Zo",
        order: 3
      },
      {
        id: '1-4',
        title: "Letters U-Z Practice",
        description: "Complete the alphabet with the final letters",
        videoId: "HSxWPhbGV_U",
        order: 4
      }
    ]
  },
  {
    id: '2',
    title: "Essential Expressions",
    description: "Learn everyday expressions and common phrases in ASL",
    level: "Beginner",
    order: 2,
    imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        id: '2-1',
        title: "Basic ASL Signs",
        description: "Learn 25 essential ASL signs for beginners",
        videoId: "v1desDduz5M",
        order: 1
      },
      {
        id: '2-2',
        title: "Common ASL Phrases",
        description: "Master essential phrases every beginner should know",
        videoId: "Fp9Z8Xh5CQ0",
        order: 2
      },
      {
        id: '2-3',
        title: "ASL Conversation Practice",
        description: "Practice basic conversations in ASL",
        videoId: "F1Z_c91UPk4",
        order: 3
      }
    ]
  },
  {
    id: '3',
    title: "Numbers & Time",
    description: "Master numbers, counting, and expressing time in ASL",
    level: "Beginner",
    order: 3,
    imageUrl: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        id: '3-1',
        title: "Numbers in ASL",
        description: "Learn to count and express numbers in ASL",
        videoId: "cJ6UFIP-Vt0",
        order: 1
      },
      {
        id: '3-2',
        title: "Time Expressions",
        description: "Learn to express time and schedules in ASL",
        videoId: "h7hGqB0U9DE",
        order: 2
      },
      {
        id: '3-3',
        title: "Calendar & Dates",
        description: "Master days, months, and dates in ASL",
        videoId: "VmB_HnZvKPU",
        order: 3
      }
    ]
  },
  {
    id: '4',
    title: "Family & Relationships",
    description: "Learn signs for family members and expressing relationships",
    level: "Intermediate",
    order: 4,
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        id: '4-1',
        title: "Family Signs",
        description: "Learn signs for immediate family members",
        videoId: "D1gJwjunBwM",
        order: 1
      },
      {
        id: '4-2',
        title: "Extended Family",
        description: "Signs for extended family members",
        videoId: "FV5G_LSj018",
        order: 2
      },
      {
        id: '4-3',
        title: "Relationship Terms",
        description: "Express different types of relationships in ASL",
        videoId: "K7Q_PuTqZJw",
        order: 3
      }
    ]
  },
  {
    id: '5',
    title: "Colors & Descriptions",
    description: "Master colors and descriptive signs in ASL",
    level: "Intermediate",
    order: 5,
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    lessons: [
      {
        id: '5-1',
        title: "Colors in ASL",
        description: "Learn to sign colors in ASL",
        videoId: "OS0D0dTL_AM",
        order: 1
      },
      {
        id: '5-2',
        title: "Descriptive Signs",
        description: "Learn common descriptive signs",
        videoId: "rt_O_N6qNi4",
        order: 2
      },
      {
        id: '5-3',
        title: "Advanced Descriptions",
        description: "Master complex descriptions in ASL",
        videoId: "vZGZ4pPvgHY",
        order: 3
      }
    ]
  }
];

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  return Promise.resolve(sampleCourses);
};

// Get a specific course by ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const course = sampleCourses.find(c => c.id === courseId);
  return Promise.resolve(course || null);
};

// Get a specific lesson
export const getLesson = async (courseId: string, lessonId: string): Promise<Lesson | null> => {
  const course = await getCourseById(courseId);
  if (!course) return null;
  
  const lesson = course.lessons.find(l => l.id === lessonId);
  return lesson || null;
};