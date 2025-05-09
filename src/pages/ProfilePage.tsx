
import { useEffect } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertMessage } from '@/components/ui/alert-message';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      toast({
        title: `Welcome ${user.name}`,
        description: 'You can update your profile information here.',
      });
    }
  }, [user]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information and profile settings
        </p>
      </div>

      {!user?.isActive && (
        <AlertMessage
          type="warning"
          title="Account not activated"
          message="Your account is not fully activated yet. Some features might be limited."
          className="mb-6"
        />
      )}

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <ProfileForm />
      </div>
    </div>
  );
}
