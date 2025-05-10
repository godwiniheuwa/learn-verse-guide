
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminCreated, setAdminCreated] = useState(false);
  const [serverResponding, setServerResponding] = useState<boolean | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check server connectivity
  useEffect(() => {
    const checkServerConnectivity = async () => {
      try {
        // Simple check to see if we can hit the Supabase API
        const resp = await fetch("https://lemshjwutppclhhboeae.supabase.co/rest/v1/", {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA"
          }
        });
        
        if (resp.status >= 200 && resp.status < 500) {
          setServerResponding(true);
          console.log("Supabase API is responding");
        } else {
          setServerResponding(false);
          console.error("Supabase API returned error status:", resp.status);
        }
      } catch (err) {
        setServerResponding(false);
        console.error("Could not connect to Supabase API:", err);
      }
    };
    
    checkServerConnectivity();
  }, []);

  useEffect(() => {
    console.log("Login form component initialized");
    // Check for query parameters to show appropriate messages
    const params = new URLSearchParams(location.search);
    
    if (params.get('activated') === 'true') {
      setSuccessMessage('Your account has been activated successfully. You can now log in.');
    } else if (params.get('reset') === 'success') {
      setSuccessMessage('Your password has been reset successfully. You can now log in with your new password.');
    }
    
    // Redirect if user is already logged in
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [location.search, user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log("Form submitted, attempting login with:", data.email);
      
      if (!serverResponding) {
        console.warn("Server connectivity issues detected before login attempt");
      }
      
      // Use our login function from the auth context
      await login(data.email, data.password);
      console.log("Login successful, redirecting to dashboard");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login submission error:", err);
      
      // More specific error messages
      if (err.message.includes("Email not confirmed")) {
        setError("Your email has not been confirmed. Please check your inbox for the activation link.");
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("not active")) {
        setError("Your account is not active. Please check your email for the activation link or contact an administrator.");
      } else if (err.message.includes("not found")) {
        setError("Account not found. You may need to sign up first or check your email address.");
      } else if (!serverResponding) {
        setError("Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    adminCreated,
    serverResponding,
    onSubmit
  };
};
