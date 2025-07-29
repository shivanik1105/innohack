import React, { useState } from 'react';
import { Course, CourseCertificate } from '../types/courses';
import Courses from './Courses';
import CourseDetail from './CourseDetail';
import CourseQuiz from './CourseQuiz';

interface CoursesManagerProps {
  userId: string;
  userName: string;
  onCertificateEarned: (certificate: any) => void; // Will integrate with existing certificate system
}

type ViewState = 'courses' | 'course-detail' | 'quiz';

const CoursesManager: React.FC<CoursesManagerProps> = ({ 
  userId, 
  userName, 
  onCertificateEarned 
}) => {
  const [currentView, setCurrentView] = useState<ViewState>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
  };

  const handleStartQuiz = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('quiz');
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
  };

  const handleBackToCourseDetail = () => {
    setCurrentView('course-detail');
  };

  const handleCertificateEarned = async (courseCertificate: CourseCertificate) => {
    try {
      // Save certificate to database
      const certificateData = {
        title: `${courseCertificate.skill} Certificate`,
        courseId: courseCertificate.courseId,
        courseName: courseCertificate.courseName,
        skill: courseCertificate.skill,
        score: courseCertificate.score,
        verificationCode: courseCertificate.verificationCode,
        imageUrl: generateCertificateImage(courseCertificate)
      };

      const response = await fetch(`/api/users/${userId}/save-course-certificate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Course certificate saved to database:', result);

        // Convert course certificate to the format expected by the existing certificate system
        const certificate = {
          id: result.certificate_id?.toString() || courseCertificate.id,
          title: `${courseCertificate.skill} Certificate`,
          type: 'ngo' as const, // Using NGO type for course certificates
          imageUrl: generateCertificateImage(courseCertificate),
          isVerified: true,
          verificationData: {
            extractedText: `Certificate of Completion for ${courseCertificate.courseName}`,
            confidence: 1.0,
            verificationStatus: 'verified',
            nameVerification: {
              match: true,
              confidence: 1.0,
              extracted_name: courseCertificate.userName,
              user_name: courseCertificate.userName,
              reason: 'Course certificate automatically verified'
            },
            courseData: {
              courseId: courseCertificate.courseId,
              courseName: courseCertificate.courseName,
              skill: courseCertificate.skill,
              score: courseCertificate.score,
              verificationCode: courseCertificate.verificationCode,
              platform: 'InnoHack Skills Platform'
            }
          },
          uploadedAt: courseCertificate.issuedAt,
          verifiedAt: courseCertificate.issuedAt
        };

        // Call the parent's certificate handler
        onCertificateEarned(certificate);
      } else {
        console.error('Failed to save course certificate to database');
      }
    } catch (error) {
      console.error('Error saving course certificate:', error);
    }

    // Go back to courses (no popup)
    handleBackToCourses();
  };

  const generateCertificateImage = (courseCertificate: CourseCertificate): string => {
    // Create a simple certificate image using Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 560);

    // Inner border
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 720, 520);

    // Title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', 400, 120);

    // Subtitle
    ctx.fillStyle = '#374151';
    ctx.font = '20px Arial';
    ctx.fillText('This is to certify that', 400, 180);

    // Name
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(courseCertificate.userName.toUpperCase(), 400, 240);

    // Course info
    ctx.fillStyle = '#374151';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully completed the course', 400, 290);

    // Course name
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(courseCertificate.courseName, 400, 340);

    // Skill
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText(`Skill: ${courseCertificate.skill}`, 400, 380);

    // Score
    ctx.fillText(`Score: ${courseCertificate.score}%`, 400, 410);

    // Date
    const date = new Date(courseCertificate.issuedAt).toLocaleDateString();
    ctx.fillText(`Date: ${date}`, 400, 440);

    // Platform
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText('InnoHack Skills Platform', 400, 480);

    // Verification code
    ctx.font = '14px Arial';
    ctx.fillText(`Verification Code: ${courseCertificate.verificationCode}`, 400, 520);

    return canvas.toDataURL('image/png');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'courses' && (
        <Courses onCourseSelect={handleCourseSelect} />
      )}

      {currentView === 'course-detail' && selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          userId={userId}
          onBack={handleBackToCourses}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {currentView === 'quiz' && selectedCourse && (
        <CourseQuiz
          course={selectedCourse}
          userId={userId}
          userName={userName}
          onBack={handleBackToCourseDetail}
          onCertificateEarned={handleCertificateEarned}
        />
      )}
    </div>
  );
};

export default CoursesManager;
