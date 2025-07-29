export interface Course {
  id: string;
  title: string;
  description: string;
  skill: string;
  category: 'construction' | 'electrical' | 'plumbing' | 'mechanical' | 'automotive' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g., "2 hours"
  thumbnail: string;
  videos: CourseVideo[];
  quiz: Quiz;
  certificateTemplate: string;
  enrolledCount: number;
  rating: number;
  instructor: string;
}

export interface CourseVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string; // YouTube video ID
  duration: string; // e.g., "15:30"
  order: number;
  isCompleted?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number; // percentage required to pass
  timeLimit: number; // minutes
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  courseId: string;
  userId: string;
  answers: number[];
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number; // seconds
}

export interface CourseCertificate {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  courseName: string;
  skill: string;
  score: number;
  issuedAt: string;
  certificateUrl: string;
  verificationCode: string;
}

export interface UserCourseProgress {
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedVideos: string[];
  quizAttempts: QuizAttempt[];
  isCompleted: boolean;
  certificateId?: string;
}
