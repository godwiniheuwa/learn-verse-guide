
import { useState, useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AlertMessage } from '@/components/ui/alert-message';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Define the login form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);
  const [serverResponding, setServerResponding] = useState<boolean | null>(null);
  
  // Check if the user just created an admin account
  const [adminCreated, setAdminCreated] = useState(false);
  
  // Form hook
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check for query parameters to show appropriate messages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.get('activated') === 'true') {
      setSuccessMessage('Your account has been activated successfully. You can now log in.');
    } else if (params.get('reset') === 'success') {
      setSuccessMessage('Your password has been reset successfully. You can now log in with your new password.');
    } else if (params.get('admin') === 'created') {
      setSuccessMessage('Admin account created successfully. You can log in with the provided credentials.');
      setAdminCreated(true);
      
      // Pre-fill the form with admin credentials
      form.setValue('email', 'admin@examprep.com');
      form.setValue('password', 'Admin@123456');
    }
    
    // Check server connectivity
    checkServerConnectivity();
  }, [location.search]);
  
  // Show admin hint after multiple failed attempts
  useEffect(() => {
    if (loginAttempts >= 3 && error) {
      setShowAdminHint(true);
    }
  }, [loginAttempts, error]);

  // Check if the backend server is responding
  const checkServerConnectivity = async () => {
    try {
      const resp = await fetch("/api/auth/validate", {
        method: 'GET',
      });
      
      setServerResponding(resp.status !== 404);
    } catch (err) {
      console.error("Could not connect to API:", err);
      setServerResponding(false);
    }
  };

  // Handle form submission with attempt tracking
  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setLoginAttempts(prev => prev + 1);
      
      // For debugging on third attempt
      if (loginAttempts >= 2) {
        console.log("Multiple login attempts detected. Form values:", values);
      }
      
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {successMessage && (
        <AlertMessage
          type="success"
          title="Success"
          message={successMessage}
          autoHide={true}
          hideAfter={10000}
          onHide={() => setSuccessMessage(null)}
        />
      )}
      
      {error && (
        <AlertMessage
          type="error"
          title="Error"
          message={error}
          onHide={() => setError(null)}
        />
      )}
      
      {serverResponding === false && (
        <AlertMessage
          type="warning"
          title="Connection Issue"
          message="We're having trouble connecting to the server. Your login may not work. Please check your internet connection."
          onHide={() => {}}
        />
      )}
      
      {showAdminHint && (
        <AlertMessage
          type="info"
          title="Need Help?"
          message="Try using admin@examprep.com with password Admin@123456"
          onHide={() => setShowAdminHint(false)}
        />
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
          
          {loginAttempts >= 2 && (
            <div className="text-center text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>Having trouble? Try admin@examprep.com / Admin@123456</span>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
