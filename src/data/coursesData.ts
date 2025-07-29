import { Course } from '../types/courses';

export const coursesData: Course[] = [
  {
    id: 'electrical-basics',
    title: 'Electrical Work Fundamentals',
    description: 'Learn the basics of electrical work, safety procedures, and common electrical tasks',
    skill: 'Electrical Work',
    category: 'electrical',
    difficulty: 'beginner',
    duration: '3 hours',
    thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    instructor: 'Expert Electrician',
    enrolledCount: 1250,
    rating: 4.8,
    certificateTemplate: 'electrical-basic',
    videos: [
      {
        id: 'elec-1',
        title: 'Electrical Safety Basics',
        description: 'Understanding electrical safety and basic precautions',
        youtubeId: 'fJeRabV5hNU', // Real electrical safety video
        duration: '12:45',
        order: 1
      },
      {
        id: 'elec-2', 
        title: 'Basic Electrical Tools',
        description: 'Introduction to common electrical tools and their uses',
        youtubeId: 'VV_fAQjBSV8', // Real electrical tools video
        duration: '15:30',
        order: 2
      },
      {
        id: 'elec-3',
        title: 'Understanding Electrical Circuits',
        description: 'Basic concepts of electrical circuits and wiring',
        youtubeId: 'w82aSjLuD_8', // Real circuits video
        duration: '18:20',
        order: 3
      }
    ],
    quiz: {
      id: 'electrical-quiz',
      title: 'Electrical Fundamentals Test',
      description: 'Test your knowledge of electrical basics and safety',
      passingScore: 70,
      timeLimit: 30,
      questions: [
        {
          id: 'q1',
          question: 'What is the first thing you should do before working on electrical equipment?',
          type: 'multiple-choice',
          options: [
            'Start working immediately',
            'Turn off power and verify it\'s off',
            'Wear gloves only',
            'Call someone for help'
          ],
          correctAnswer: 1,
          explanation: 'Always turn off power and verify it\'s off using a voltage tester before working on electrical equipment.'
        },
        {
          id: 'q2',
          question: 'Which tool is essential for checking if wires are live?',
          type: 'multiple-choice',
          options: [
            'Screwdriver',
            'Pliers',
            'Voltage tester',
            'Wire strippers'
          ],
          correctAnswer: 2,
          explanation: 'A voltage tester is essential for safely checking if wires are live before working on them.'
        },
        {
          id: 'q3',
          question: 'In a basic circuit, electricity flows from positive to negative.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'Conventional current flow is from positive to negative terminal.'
        },
        {
          id: 'q4',
          question: 'What does the ground wire do in electrical systems?',
          type: 'multiple-choice',
          options: [
            'Carries electricity to appliances',
            'Provides a safe path for fault current',
            'Increases voltage',
            'Reduces power consumption'
          ],
          correctAnswer: 1,
          explanation: 'The ground wire provides a safe path for fault current to flow, protecting people from electrical shock.'
        },
        {
          id: 'q5',
          question: 'Which PPE is most important when doing electrical work?',
          type: 'multiple-choice',
          options: [
            'Hard hat only',
            'Safety glasses only', 
            'Insulated gloves and safety glasses',
            'Regular work gloves'
          ],
          correctAnswer: 2,
          explanation: 'Insulated gloves and safety glasses are essential PPE for electrical work to prevent shock and eye injuries.'
        }
      ]
    }
  },
  {
    id: 'plumbing-basics',
    title: 'Plumbing Fundamentals',
    description: 'Master basic plumbing skills, pipe fitting, and common repairs',
    skill: 'Plumbing',
    category: 'plumbing',
    difficulty: 'beginner',
    duration: '2.5 hours',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    instructor: 'Master Plumber',
    enrolledCount: 980,
    rating: 4.6,
    certificateTemplate: 'plumbing-basic',
    videos: [
      {
        id: 'plumb-1',
        title: 'Plumbing Tools and Materials',
        description: 'Essential tools and materials for plumbing work',
        youtubeId: 'LzTwpzHKFZY', // Real plumbing tools video
        duration: '14:15',
        order: 1
      },
      {
        id: 'plumb-2',
        title: 'Basic Pipe Fitting',
        description: 'How to cut, fit, and join pipes properly',
        youtubeId: 'eBtkApCnoto', // Real pipe fitting video
        duration: '16:45',
        order: 2
      },
      {
        id: 'plumb-3',
        title: 'Common Plumbing Repairs',
        description: 'Fixing leaks, unclogging drains, and basic repairs',
        youtubeId: 'VK5ZvQy7R6g', // Real plumbing repairs video
        duration: '19:30',
        order: 3
      }
    ],
    quiz: {
      id: 'plumbing-quiz',
      title: 'Plumbing Fundamentals Test',
      description: 'Test your knowledge of plumbing basics and techniques',
      passingScore: 70,
      timeLimit: 25,
      questions: [
        {
          id: 'q1',
          question: 'What is the most common cause of pipe leaks?',
          type: 'multiple-choice',
          options: [
            'High water pressure',
            'Loose fittings',
            'Old age and corrosion',
            'Temperature changes'
          ],
          correctAnswer: 2,
          explanation: 'Old age and corrosion are the most common causes of pipe leaks over time.'
        },
        {
          id: 'q2',
          question: 'Which tool is best for cutting copper pipes?',
          type: 'multiple-choice',
          options: [
            'Hacksaw',
            'Pipe cutter',
            'Angle grinder',
            'Chisel'
          ],
          correctAnswer: 1,
          explanation: 'A pipe cutter provides clean, straight cuts on copper pipes without burrs.'
        },
        {
          id: 'q3',
          question: 'PVC pipes can be joined using solvent cement.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'PVC pipes are commonly joined using solvent cement which chemically welds the pieces together.'
        }
      ]
    }
  },
  {
    id: 'construction-safety',
    title: 'Construction Safety Essentials',
    description: 'Learn essential safety practices for construction work',
    skill: 'Construction Safety',
    category: 'construction',
    difficulty: 'beginner',
    duration: '2 hours',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    instructor: 'Safety Expert',
    enrolledCount: 2100,
    rating: 4.9,
    certificateTemplate: 'safety-basic',
    videos: [
      {
        id: 'safety-1',
        title: 'Personal Protective Equipment (PPE)',
        description: 'Understanding and using PPE correctly',
        youtubeId: 'Gu0TurCDC94', // Real PPE video
        duration: '11:20',
        order: 1
      },
      {
        id: 'safety-2',
        title: 'Fall Protection Systems',
        description: 'Preventing falls and using safety harnesses',
        youtubeId: 'QUZBqBKNFZs', // Real fall protection video
        duration: '13:45',
        order: 2
      },
      {
        id: 'safety-3',
        title: 'Hazard Identification',
        description: 'Identifying and mitigating workplace hazards',
        youtubeId: 'rDSk6cF3hLw', // Real hazard identification video
        duration: '15:10',
        order: 3
      }
    ],
    quiz: {
      id: 'safety-quiz',
      title: 'Construction Safety Test',
      description: 'Test your knowledge of construction safety practices',
      passingScore: 80,
      timeLimit: 20,
      questions: [
        {
          id: 'q1',
          question: 'What is the minimum height at which fall protection is required?',
          type: 'multiple-choice',
          options: [
            '4 feet',
            '6 feet', 
            '8 feet',
            '10 feet'
          ],
          correctAnswer: 1,
          explanation: 'Fall protection is generally required at heights of 6 feet or more in construction.'
        },
        {
          id: 'q2',
          question: 'Hard hats must be worn at all times on construction sites.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'Hard hats are required at all times on construction sites to protect from falling objects.'
        }
      ]
    }
  }
];

export const getCoursesByCategory = (category: string) => {
  return coursesData.filter(course => course.category === category);
};

export const getCourseById = (id: string) => {
  return coursesData.find(course => course.id === id);
};

export const searchCourses = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return coursesData.filter(course =>
    course.title.toLowerCase().includes(lowercaseQuery) ||
    course.description.toLowerCase().includes(lowercaseQuery) ||
    course.skill.toLowerCase().includes(lowercaseQuery)
  );
};

export const courseCategories = [
  { id: 'all', name: 'All Courses', icon: '📚' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'construction', name: 'Construction', icon: '🏗️' },
  { id: 'mechanical', name: 'Mechanical', icon: '⚙️' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'general', name: 'General Skills', icon: '🛠️' }
];
