 import { Job, Worker } from '../types/worker'; // Ensure this path is correct

 // In Vite, environment variables are accessed via `import.meta.env`
 const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

 const handleResponse = async (response: Response) => {
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
     throw new Error(errorData.error || `Request failed with status ${response.status}`);
   }
   return response.json();
 };

 export const registerOrLoginUser = async (token: string): Promise<{ isNewUser: boolean; user: Worker }> => {
     const response = await fetch(`${API_BASE_URL}/api/auth/register-login/`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ token }),
     });
     return handleResponse(response);
 };

 export const updateUserProfile = async (uid: string, profileData: Partial<Worker>): Promise<Worker> => {
     const response = await fetch(`${API_BASE_URL}/api/profile/${uid}/`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(profileData),
     });
     return handleResponse(response);
 };

 export const getJobsByPincode = async (pincode: string): Promise<Job[]> => {
     const response = await fetch(`${API_BASE_URL}/api/jobs/?pincode=${pincode}`);
     return handleResponse(response);
 };

export const getJobRecommendations = async (uid: string): Promise<Job[]> => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/recommendations/${uid}/`);
    const data = await handleResponse(response);
    // The API now returns an object with jobs array and metadata
    return data.jobs || data; // Fallback to data if jobs property doesn't exist
};
 
 export const verifyCertificate = async (uid: string, imageFile: File) => {
     const formData = new FormData();
     formData.append('certificate_image', imageFile);

     const response = await fetch(`${API_BASE_URL}/api/verify-certificate/${uid}/`, {
         method: 'POST',
         body: formData,
     });
     return handleResponse(response);
 };


export const sendOtp = async (phoneNumber: string): Promise<{ session_id: string }> => {
  console.log('Sending OTP for phone number:', phoneNumber);
  const response = await fetch(`${API_BASE_URL}/api/auth/send-otp/`, { // Ensure this URL matches your backend urls.py
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  return handleResponse(response);
};

export const verifyOtp = async (otp: string, phoneNumber: string): Promise<{ is_new_user: boolean; user: Worker }> => {
  console.log('Verifying OTP:', otp, 'for phone number:', phoneNumber);
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, { // Ensure this URL matches your backend urls.py
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp, phoneNumber }),
  });
  const result = await handleResponse(response);
  console.log('OTP verification result:', result);
  return result;
};
