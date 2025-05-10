
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertMessage } from '@/components/ui/alert-message';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createAdminUser } from '@/services/auth.service';
import { motion } from 'framer-motion';

const CreateAdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const navigate = useNavigate();
  
  const handleCreateAdmin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await createAdminUser();
      setCredentials({
        email: result.credentials.email,
        password: result.credentials.password
      });
      setIsComplete(true);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToLogin = () => {
    navigate('/login?admin=created');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Admin Account</CardTitle>
            <CardDescription className="text-center">
              Creates a default admin user for the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <AlertMessage
                type="error"
                title="Error"
                message={error}
                onHide={() => setError(null)}
              />
            )}
            
            {isComplete ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Admin Created Successfully</h3>
                  <p>Use the following credentials to log in:</p>
                  <div className="bg-muted p-4 rounded-md text-left">
                    <p><span className="font-semibold">Email:</span> {credentials?.email}</p>
                    <p><span className="font-semibold">Password:</span> {credentials?.password}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Make sure to change this password after logging in.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center">
                  This will create an admin user if one doesn't already exist.
                  You can use this account to manage the entire application.
                </p>
                <Button 
                  onClick={handleCreateAdmin} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating admin...
                    </>
                  ) : (
                    'Create Admin Account'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {isComplete ? (
              <Button onClick={goToLogin} className="w-full">
                Go to Login
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                Back to Login
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateAdminPage;
