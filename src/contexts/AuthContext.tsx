
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useLogin } from '@/hooks/auth/use-login';
import { useSignup } from '@/hooks/auth/use-signup';
import { usePasswordReset } from '@/hooks/auth/use-password-reset';
import { useLogout } from '@/hooks/auth/use-logout';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First get the auth state (user, loading, checkUser)
  const authState = useAuthState();
  const { user, loading, checkUser } = authState;
  
  // Then use these hooks consistently in the same order every render
  const { login, authError: loginError } = useLogin(checkUser);
  const { signup, authError: signupError } = useSignup();
  const { forgotPassword, resetPassword, authError: passwordResetError } = usePasswordReset();
  const { logout, authError: logoutError } = useLogout(checkUser);
  
  // Combine all auth errors
  const authError = loginError || signupError || passwordResetError || logoutError;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      forgotPassword,
      resetPassword,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
