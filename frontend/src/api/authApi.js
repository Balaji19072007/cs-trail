// frontend/src/api/authApi.js

const API_BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Utility function to handle API response parsing and error checking.
 */
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.msg || `API Error: ${response.statusText}`);
    }
    return data;
};

/**
 * Sends credentials for local sign-in.
 */
export const signInLocal = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
};

/**
 * Sends Google ID token for sign-in/sign-up.
 */
export const signInGoogle = async (idToken) => {
    // FIX: Updated to use the correct Google Auth endpoint /api/google-auth
    const response = await fetch(`http://localhost:5000/api/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    return handleResponse(response);
};

/**
 * Sends profile update data. Can handle both JSON (for name/bio only) and FormData (for file upload).
 * @param {object | FormData} profileData - Either an object for text fields or FormData for file upload.
 */
export const updateProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    
    if (!token) throw new Error("Authentication token missing.");

    // Check if profileData is FormData (used for file uploads)
    const isFormData = profileData instanceof FormData;
    
    const headers = {
        // CRITICAL: Ensure 'x-auth-token' is set for backend authentication middleware
        'x-auth-token': token 
    };

    if (!isFormData) {
        // For non-file updates (name/bio only), send as JSON
        headers['Content-Type'] = 'application/json';
    } 
    // IMPORTANT: If sending FormData (file upload), DO NOT set 'Content-Type'. 
    // The browser automatically sets the correct 'multipart/form-data' header.

    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: headers,
        // If it's FormData, pass the object directly. Otherwise, stringify the JSON payload.
        body: isFormData ? profileData : JSON.stringify(profileData),
    });
    
    return handleResponse(response);
};