import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Clock, Users, Star, Play, 
  BookOpen, Award, ChevronRight, GraduationCap 
} from 'lucide-react';
import { Course } from '../types/courses';
import { coursesData, courseCategories, searchCourses, getCoursesByCategory } from '../data/coursesData';

interface CoursesProps {
  onCourseSelect: (course: Course) => void;
}

const Courses: React.FC<CoursesProps> = ({ onCourseSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(coursesData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilteredCourses(query, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateFilteredCourses(searchQuery, category);
  };

  const updateFilteredCourses = (query: string, category: string) => {
    let courses = coursesData;
    
    if (category !== 'all') {
      courses = getCoursesByCategory(category);
    }
    
    if (query.trim()) {
      courses = searchCourses(query).filter(course => 
        category === 'all' || course.category === category
      );
    }
    
    setFilteredCourses(courses);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎓 Skill Development Courses
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn new skills with video tutorials and earn certificates by passing skill tests. 
          All certificates are automatically added to your profile.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses by skill, title, or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {courseCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer"
            onClick={() => onCourseSelect(course)}
          >
            {/* Course Thumbnail */}
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center">
                <Play className="w-3 h-3 mr-1" />
                {course.videos.length} videos
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

              {/* Course Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolledCount.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {course.rating}
                </div>
              </div>

              {/* Skill Badge */}
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {course.skill}
                </span>
              </div>

              {/* Start Course Button */}
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                Start Learning
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* How it Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">1️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Choose Course</h3>
            <p className="text-sm text-gray-600">Select a course based on your skill interest</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">2️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Watch Videos</h3>
            <p className="text-sm text-gray-600">Learn from curated YouTube tutorials</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">3️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Take Test</h3>
            <p className="text-sm text-gray-600">Pass the skill assessment quiz</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">4️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Get Certificate</h3>
            <p className="text-sm text-gray-600">Receive verified certificate automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
