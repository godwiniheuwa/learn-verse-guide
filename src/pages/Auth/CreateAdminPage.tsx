
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { AlertMessage } from '@/components/ui/alert-message';
import { Loader2 } from 'lucide-react';

// Use these constants instead of accessing supabase.supabaseUrl and supabase.supabaseKey
const SUPABASE_URL = "https://lemshjwutppclhhboeae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbXNoand1dHBwY2xoaGJvZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjI4ODEsImV4cCI6MjA2MjM5ODg4MX0.xslVb5AhvLEBJ8JrSAbANErkzqiWxfUdXni0iICdorA";

const CreateAdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{email: string, password: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Try to create admin automatically when the page loads
    createAdminUser();
  }, []);

  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/create-admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }
      
      setAdminCredentials(data.credentials);
      
      toast({
        title: 'Success',
        description: 'Admin user created or already exists and is activated',
      });
    } catch (error: any) {
      console.error("Error creating admin:", error);
      setError(error.message || 'Failed to create admin user');
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin User Setup</CardTitle>
          <CardDescription className="text-center">
            Create an admin user for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <AlertMessage
              type="error"
              title="Error"
              message={error}
              onHide={() => setError(null)}
            />
          )}
          
          <Button 
            onClick={createAdminUser} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating admin...
              </>
            ) : (
              'Create/Activate Admin User'
            )}
          </Button>
          
          {adminCredentials && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Admin Credentials</h3>
              <p><strong>Email:</strong> {adminCredentials.email}</p>
              <p><strong>Password:</strong> {adminCredentials.password}</p>
              <p className="text-sm text-muted-foreground mt-2">
                These credentials can be used to log in immediately.
              </p>
            </div>
          )}
          
          {adminCredentials && (
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <Link to="/login">
                Go to Login Page
              </Link>
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!adminCredentials && (
            <Link to="/login" className="text-primary hover:underline">
              Back to Login Page
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdminPage;
