
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
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Check for query parameters to show appropriate messages
    const params = new URLSearchParams(location.search);
    
    if (params.get('activated') === 'true') {
      setSuccessMessage('Your account has been activated successfully. You can now log in.');
    } else if (params.get('reset') === 'success') {
      setSuccessMessage('Your password has been reset successfully. You can now log in with your new password.');
    }
    
    // Try to create/activate admin account automatically
    const createAdminAccount = async () => {
      try {
        const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/create-admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log("Admin user created or activated:", data);
          setAdminCreated(true);
          setSuccessMessage(prev => 
            (prev ? `${prev} ` : '') + 
            'Admin account is ready. You can log in with admin@examprep.com and password Admin@123456'
          );
        }
      } catch (error) {
        console.error("Error creating admin:", error);
      }
    };
    
    createAdminAccount();
    
    // Redirect if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [location.search, user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use our login function from the auth context
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      
      // More specific error messages
      if (err.message.includes("Email not confirmed")) {
        setError("Your email has not been confirmed. Please check your inbox for the activation link.");
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("not active")) {
        setError("Your account is not active. Please check your email for the activation link or create an admin account.");
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
    onSubmit
  };
};
