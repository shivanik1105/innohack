import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, CheckCircle, Clock, Users, Star, 
  Award, BookOpen, FileText, Timer, Target
} from 'lucide-react';
import { Course, CourseVideo, UserCourseProgress } from '../types/courses';

interface CourseDetailProps {
  course: Course;
  userId: string;
  onBack: () => void;
  onStartQuiz: (course: Course) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ 
  course, 
  userId, 
  onBack, 
  onStartQuiz 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo>(course.videos[0]);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem(`course_progress_${userId}_${course.id}`);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setProgress(progressData);
      setCompletedVideos(progressData.completedVideos || []);
    } else {
      // Initialize new progress
      const newProgress: UserCourseProgress = {
        courseId: course.id,
        userId,
        enrolledAt: new Date().toISOString(),
        completedVideos: [],
        quizAttempts: [],
        isCompleted: false
      };
      setProgress(newProgress);
    }
  }, [course.id, userId]);

  const markVideoCompleted = (videoId: string) => {
    if (!completedVideos.includes(videoId)) {
      const newCompletedVideos = [...completedVideos, videoId];
      setCompletedVideos(newCompletedVideos);
      
      // Update progress
      if (progress) {
        const updatedProgress = {
          ...progress,
          completedVideos: newCompletedVideos
        };
        setProgress(updatedProgress);
        localStorage.setItem(
          `course_progress_${userId}_${course.id}`, 
          JSON.stringify(updatedProgress)
        );
      }
    }
  };

  const getVideoProgress = () => {
    return (completedVideos.length / course.videos.length) * 100;
  };

  const canTakeQuiz = () => {
    return completedVideos.length === course.videos.length;
  };

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </button>
        
        <div className="text-sm text-gray-500">
          Progress: {Math.round(getVideoProgress())}% Complete
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full lg:w-64 h-48 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {course.enrolledCount.toLocaleString()} enrolled
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {course.rating} rating
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {course.videos.length} videos
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {course.skill}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {course.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Course Progress</span>
            <span>{completedVideos.length}/{course.videos.length} videos completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getVideoProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.youtubeId)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedVideo.title}
              </h2>
              <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedVideo.duration}
                </div>
                
                {!completedVideos.includes(selectedVideo.id) && (
                  <button
                    onClick={() => markVideoCompleted(selectedVideo.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Complete
                  </button>
                )}
                
                {completedVideos.includes(selectedVideo.id) && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video List */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Videos</h3>
            <div className="space-y-3">
              {course.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVideo.id === video.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedVideos.includes(video.id)
                        ? 'bg-green-100 text-green-800'
                        : selectedVideo.id === video.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {completedVideos.includes(video.id) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {video.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Skill Assessment
            </h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">{course.quiz.title}</h4>
                <p className="text-sm text-yellow-800 mb-3">{course.quiz.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-yellow-700">
                    <FileText className="w-4 h-4 mr-1" />
                    {course.quiz.questions.length} questions
                  </div>
                  <div className="flex items-center text-yellow-700">
                    <Timer className="w-4 h-4 mr-1" />
                    {course.quiz.timeLimit} minutes
                  </div>
                  <div className="flex items-center text-yellow-700">
                    <Target className="w-4 h-4 mr-1" />
                    {course.quiz.passingScore}% to pass
                  </div>
                  <div className="flex items-center text-yellow-700">
                    <Award className="w-4 h-4 mr-1" />
                    Certificate
                  </div>
                </div>
              </div>

              {canTakeQuiz() ? (
                <button
                  onClick={() => onStartQuiz(course)}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center"
                >
                  <Award className="w-5 h-5 mr-2" />
                  Take Assessment & Get Certificate
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Complete all videos to unlock the assessment
                  </p>
                  <div className="text-xs text-gray-500">
                    {completedVideos.length}/{course.videos.length} videos completed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
