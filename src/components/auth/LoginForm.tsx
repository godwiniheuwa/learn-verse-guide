
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AlertMessage } from '@/components/ui/alert-message';
import { useLoginForm, type LoginFormValues } from '@/hooks/auth/use-login-form';

export const LoginForm = () => {
  const { 
    form, 
    isSubmitting, 
    error, 
    setError, 
    successMessage, 
    setSuccessMessage, 
    adminCreated,
    onSubmit 
  } = useLoginForm();

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
    </>
  );
};
