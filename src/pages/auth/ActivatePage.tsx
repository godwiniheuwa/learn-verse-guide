
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AlertMessage } from '@/components/ui/alert-message';

const ActivatePage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivation = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('Invalid activation link. Token is missing.');
        }
        
        // Activating account via redirect will be handled by the edge function
        // This page is just a fallback in case the redirect doesn't work
        setLoading(false);
        setError('If you are not redirected automatically, your account may already be activated.');
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Failed to activate account. Please try again or contact support.');
      }
    };
    
    fetchActivation();
  }, [location.search]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Account Activation</CardTitle>
          <CardDescription className="text-center">
            Activating your ExamPrep account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center">Activating your account...</p>
            </div>
          )}
          
          {success && (
            <AlertMessage
              type="success"
              title="Activation Successful"
              message="Your account has been activated successfully. You can now log in."
              autoHide={false}
            />
          )}
          
          {error && (
            <AlertMessage
              type="error"
              title="Activation Error"
              message={error}
              autoHide={false}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ActivatePage;
