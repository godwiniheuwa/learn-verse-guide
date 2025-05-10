
// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/backend' // Change to your actual production domain
  : 'http://localhost/backend'; // Local development URL

export const API_URL = API_BASE_URL;

export const APP_NAME = 'ExamPrep';
export const APP_VERSION = '1.0.0';
