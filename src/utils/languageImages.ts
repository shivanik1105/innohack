/**
 * Language-specific images for different components
 */

export interface LanguageImages {
  registration: {
    hero: string;
    workers: string;
    construction: string;
    success: string;
  };
  dashboard: {
    welcome: string;
    jobs: string;
    profile: string;
  };
  jobs: {
    construction: string;
    cleaning: string;
    loading: string;
    skilled: string;
  };
}

// Default English images (using placeholder service for demo)
const englishImages: LanguageImages = {
  registration: {
    hero: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzNzNkYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVOPC90ZXh0Pjwvc3ZnPg==',
    workers: '/images/workers-team-en.jpg',
    construction: '/images/construction-site-en.jpg',
    success: '/images/success-en.jpg'
  },
  dashboard: {
    welcome: '/images/dashboard-welcome-en.jpg',
    jobs: '/images/jobs-listing-en.jpg',
    profile: '/images/profile-en.jpg'
  },
  jobs: {
    construction: '/images/construction-job-en.jpg',
    cleaning: '/images/cleaning-job-en.jpg',
    loading: '/images/loading-job-en.jpg',
    skilled: '/images/skilled-job-en.jpg'
  }
};

// Hindi images (using placeholder service for demo)
const hindiImages: LanguageImages = {
  registration: {
    hero: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2UyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Y5NzMxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuCkueCkv+CkguCkpuClgDwvdGV4dD48L3N2Zz4=',
    workers: '/images/workers-team-hi.jpg',
    construction: '/images/construction-site-hi.jpg',
    success: '/images/success-hi.jpg'
  },
  dashboard: {
    welcome: '/images/dashboard-welcome-hi.jpg',
    jobs: '/images/jobs-listing-hi.jpg',
    profile: '/images/profile-hi.jpg'
  },
  jobs: {
    construction: '/images/construction-job-hi.jpg',
    cleaning: '/images/cleaning-job-hi.jpg',
    loading: '/images/loading-job-hi.jpg',
    skilled: '/images/skilled-job-hi.jpg'
  }
};

// Marathi images (using placeholder service for demo)
const marathiImages: LanguageImages = {
  registration: {
    hero: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzA1OWY2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuCkruCksOCkvuCkoeCljjwvdGV4dD48L3N2Zz4=',
    workers: '/images/workers-team-mr.jpg',
    construction: '/images/construction-site-mr.jpg',
    success: '/images/success-mr.jpg'
  },
  dashboard: {
    welcome: '/images/dashboard-welcome-mr.jpg',
    jobs: '/images/jobs-listing-mr.jpg', 
    profile: '/images/profile-mr.jpg'
  },
  jobs: {
    construction: '/images/construction-job-mr.jpg',
    cleaning: '/images/cleaning-job-mr.jpg',
    loading: '/images/loading-job-mr.jpg',
    skilled: '/images/skilled-job-mr.jpg'
  }
};

/**
 * Get language-specific images
 */
export const getLanguageImages = (language: string): LanguageImages => {
  switch (language) {
    case 'hi':
      return hindiImages;
    case 'mr':
      return marathiImages;
    default:
      return englishImages;
  }
};

/**
 * Get specific image for current language
 */
export const getLocalizedImage = (
  category: keyof LanguageImages,
  imageName: string,
  language: string
): string => {
  const images = getLanguageImages(language);
  const categoryImages = images[category] as any;
  return categoryImages[imageName] || englishImages[category][imageName as keyof typeof englishImages[typeof category]];
};

/**
 * Fallback images if localized versions don't exist
 */
export const getImageWithFallback = (
  primaryImage: string,
  fallbackImage: string
): string => {
  // In a real app, you'd check if the image exists
  // For now, we'll return the primary image
  return primaryImage;
};
