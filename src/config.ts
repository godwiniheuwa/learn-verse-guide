
// API configuration
// This should point to your actual PHP host once deployed
// For local development, you might need to use a different URL

// During development, you can use a local PHP server or a remote development server
const DEV_API_URL = 'http://localhost:8080/backend/api';  // Replace with your local development PHP server URL

// In production, use your Hostinger PHP server domain
const PROD_API_URL = 'https://yourdomain.com/backend/api'; // Replace with your actual domain on Hostinger

export const API_URL = process.env.NODE_ENV === 'production' ? PROD_API_URL : DEV_API_URL;

// For testing/development with a mock API
export const USE_MOCK_API = false; // Set to true to use mock data instead of real API calls

export const APP_NAME = 'ExamPrep';
export const APP_VERSION = '1.0.0';
