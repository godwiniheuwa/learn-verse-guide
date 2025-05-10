
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';

const LoginPage = () => {
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
          <LoginForm />
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
