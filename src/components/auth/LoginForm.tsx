
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AlertMessage } from '@/components/ui/alert-message';
import { useLoginForm, type LoginFormValues } from '@/hooks/auth/use-login-form';
import { useState, useEffect } from 'react';

export const LoginForm = () => {
  const { 
    form, 
    isSubmitting, 
    error, 
    setError, 
    successMessage, 
    setSuccessMessage, 
    adminCreated,
    serverResponding,
    onSubmit 
  } = useLoginForm();
  
  // Login attempts tracking
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);

  // Show admin hint after multiple failed attempts
  useEffect(() => {
    if (loginAttempts >= 3 && error) {
      setShowAdminHint(true);
    }
  }, [loginAttempts, error]);

  // Handle form submission with attempt tracking
  const handleSubmit = async (values: LoginFormValues) => {
    setLoginAttempts(prev => prev + 1);
    
    // For debugging on third attempt
    if (loginAttempts >= 2) {
      console.log("Multiple login attempts detected. Form values:", values);
      console.log("Current auth state:", { isSubmitting, error, successMessage });
    }
    
    await onSubmit(values);
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
