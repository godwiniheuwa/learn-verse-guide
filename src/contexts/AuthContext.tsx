
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useLogin, useSignup, usePasswordReset, useLogout } from '@/hooks/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, checkUser } = useAuthState();
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
