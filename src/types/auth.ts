
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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
};
