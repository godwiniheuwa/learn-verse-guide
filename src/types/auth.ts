
export type User = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'student' | 'teacher' | 'examiner' | 'admin';
  isActive: boolean;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  authError?: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
};
