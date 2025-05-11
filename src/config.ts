
// // API configuration
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? '/api' // Production path (relative to domain root)
//   : '/api'; // Development path


const API_BASE_URL =
  /* e.g. https://preview-foo.lovable.app */ window.location.origin +
  /* path to where your PHP scripts live */ '/backend/api';

export const API_URL = API_BASE_URL;

export const APP_NAME = 'ExamPrep';
export const APP_VERSION = '1.0.0';
