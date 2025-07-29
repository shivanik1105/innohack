import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, CheckCircle, XCircle, Award, 
  AlertCircle, Timer, Target, FileText, Trophy
} from 'lucide-react';
import { Course, Quiz, QuizQuestion, QuizAttempt, CourseCertificate } from '../types/courses';

interface CourseQuizProps {
  course: Course;
  userId: string;
  userName: string;
  onBack: () => void;
  onCertificateEarned: (certificate: CourseCertificate) => void;
}

const CourseQuiz: React.FC<CourseQuizProps> = ({ 
  course, 
  userId, 
  userName,
  onBack, 
  onCertificateEarned 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(course.quiz.timeLimit * 60); // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = course.quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === course.quiz.questions.length - 1;

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setSelectedAnswers(new Array(course.quiz.questions.length).fill(-1));
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < course.quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    course.quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / course.quiz.questions.length) * 100);
  };

  const submitQuiz = () => {
    const score = calculateScore();
    const passed = score >= course.quiz.passingScore;
    const timeSpent = (course.quiz.timeLimit * 60) - timeRemaining;

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      courseId: course.id,
      userId,
      answers: selectedAnswers,
      score,
      passed,
      completedAt: new Date().toISOString(),
      timeSpent
    };

    setQuizResult(attempt);
    setQuizCompleted(true);

    // Save attempt to localStorage
    const attempts = JSON.parse(localStorage.getItem(`quiz_attempts_${userId}`) || '[]');
    attempts.push(attempt);
    localStorage.setItem(`quiz_attempts_${userId}`, JSON.stringify(attempts));

    // If passed, generate certificate
    if (passed) {
      generateCertificate(attempt);
    }
  };

  const generateCertificate = (attempt: QuizAttempt) => {
    const certificate: CourseCertificate = {
      id: `cert_${Date.now()}`,
      courseId: course.id,
      userId,
      userName,
      courseName: course.title,
      skill: course.skill,
      score: attempt.score,
      issuedAt: new Date().toISOString(),
      certificateUrl: '', // Will be generated
      verificationCode: `SKILL-${course.id.toUpperCase()}-${Date.now().toString().slice(-6)}`
    };

    // Save certificate to localStorage
    const certificates = JSON.parse(localStorage.getItem(`certificates_${userId}`) || '[]');
    certificates.push(certificate);
    localStorage.setItem(`certificates_${userId}`, JSON.stringify(certificates));

    // Notify parent component
    onCertificateEarned(certificate);
  };

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(course.quiz.questions.length).fill(-1));
    setTimeRemaining(course.quiz.timeLimit * 60);
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizResult(null);
    setShowExplanation(false);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{course.quiz.title}</h1>
          <p className="text-gray-600 mb-8">{course.quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-900">{course.quiz.questions.length}</div>
              <div className="text-sm text-blue-700">Questions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Timer className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-900">{course.quiz.timeLimit}</div>
              <div className="text-sm text-green-700">Minutes</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-900">{course.quiz.passingScore}%</div>
              <div className="text-sm text-purple-700">To Pass</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <Trophy className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-900">Free</div>
              <div className="text-sm text-orange-700">Certificate</div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-8">
            <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> You have {course.quiz.timeLimit} minutes to complete this assessment. 
              Once started, the timer cannot be paused. Make sure you have a stable internet connection.
            </p>
          </div>

          <button
            onClick={startQuiz}
            className="bg-yellow-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-lg"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted && quizResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            quizResult.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {quizResult.passed ? (
              <Trophy className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {quizResult.passed ? '🎉 Congratulations!' : '😔 Assessment Not Passed'}
          </h1>

          <div className="text-6xl font-bold mb-4 text-gray-900">
            {quizResult.score}%
          </div>

          <p className="text-gray-600 mb-8">
            {quizResult.passed 
              ? `You've successfully passed the ${course.skill} assessment! Your certificate has been automatically added to your profile.`
              : `You need ${course.quiz.passingScore}% to pass. Don't worry, you can retake the assessment.`
            }
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-bold text-gray-900">
                {selectedAnswers.filter((answer, index) => answer === course.quiz.questions[index].correctAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-bold text-gray-900">
                {course.quiz.questions.length - selectedAnswers.filter((answer, index) => answer === course.quiz.questions[index].correctAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-bold text-gray-900">
                {Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Course
            </button>
            {!quizResult.passed && (
              <button
                onClick={retakeQuiz}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Retake Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit Quiz
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{course.quiz.title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center text-red-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {course.quiz.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / course.quiz.questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / course.quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestionIndex] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {isLastQuestion ? (
              <button
                onClick={submitQuiz}
                disabled={selectedAnswers.includes(-1)}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === -1}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Question Overview</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {course.quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : selectedAnswers[index] !== -1
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseQuiz;
