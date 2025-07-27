import { Job, Worker } from '../types/worker'; // Assuming your types are in this file

// --- CORRECTED for Vite ---
// In Vite, environment variables are accessed via `import.meta.env`
// and must be prefixed with VITE_ in your .env file.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * A helper function to handle API responses and errors.
 * @param response The raw response from the fetch call.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse error message from backend, otherwise use default
    const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

/**
 * Sends the Firebase ID token to the backend to register or log in a user.
 * @param token The Firebase ID token from the frontend.
 * @returns The user data from the backend.
 */
export const registerOrLoginUser = async (token: string): Promise<{ isNewUser: boolean; user: Worker }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error during user registration/login:', error);
    throw error;
  }
};

/**
 * Creates or updates a user's profile on the backend.
 * @param uid The user's unique Firebase ID.
 * @param profileData The data to update.
 * @returns A promise that resolves to the updated Worker object.
 */
export const updateUserProfile = async (uid: string, profileData: Partial<Worker>): Promise<Worker> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/${uid}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Fetches a list of jobs from the backend based on a pincode.
 * @param pincode The 6-digit pincode to search for.
 * @returns A promise that resolves to an array of Job objects.
 */
export const getJobsByPincode = async (pincode: string): Promise<Job[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/?pincode=${pincode}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Uploads a certificate for verification.
 * @param uid The user's unique Firebase ID.
 * @param imageFile The image file of the certificate.
 */
export const verifyCertificate = async (uid: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('certificate_image', imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-certificate/${uid}/`, {
      method: 'POST',
      body: formData, // No 'Content-Type' header needed for FormData, browser sets it
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

// You can add more functions here for every other API endpoint you need.
