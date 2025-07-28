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
  const response = await fetch(`${API_BASE_URL}/api/auth/send-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  return handleResponse(response); // Assumes you have a handleResponse function
};

export const verifyOtp = async (sessionId: string, otp: string, phoneNumber: string): Promise<{ isNewUser: boolean; user: Worker }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, otp, phoneNumber }),
  });
  return handleResponse(response);
};