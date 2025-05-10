import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AlertMessage } from '@/components/ui/alert-message';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        defaultValue={adminCreated ? "admin@examprep.com" : ""}
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
                        defaultValue={adminCreated ? "Admin@123456" : ""}
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
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up here
            </Link>
          </p>
          <Link to="/auth/forgot-password" className="text-xs text-center text-muted-foreground hover:underline">
            Forgot your password?
          </Link>
          <Link to="/auth/create-admin" className="text-xs text-center text-primary hover:underline">
            Create/Activate Admin Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
