
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Phone, Upload, User } from 'lucide-react';
import { UserProfileFormData, useUserProfile } from '@/hooks/api/use-user-profile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Define the form validation schema
const formSchema = z.object({
  phone: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export function ProfileForm() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar, uploadProgress } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: profile?.phone || '',
      date_of_birth: profile?.date_of_birth || '',
      location: profile?.location || '',
      address: profile?.address || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  // Update the form when profile data is loaded
  useState(() => {
    if (profile) {
      form.reset({
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        location: profile.location || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    updateProfile.mutate(data as UserProfileFormData);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        form.setValue('avatar_url', url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.watch('avatar_url') || undefined} alt={user?.name || ''} />
              <AvatarFallback>
                {user?.name?.split(' ').map(name => name[0]).join('') || <User />}
              </AvatarFallback>
            </Avatar>
            <Input 
              type="file" 
              id="avatar-upload" 
              className="hidden"
              accept="image/*" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
              aria-disabled={isUploading}
            >
              <Upload size={16} />
            </label>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-medium">{user?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-medium">{user?.username || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-medium">{user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter your phone number"
                      className="pl-10"
                      {...field}
                      value={field.value || ''}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-10 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="City, Country"
                      className="pl-10"
                      list="locations"
                      {...field}
                      value={field.value || ''}
                    />
                    <datalist id="locations">
                      <option value="New York, USA" />
                      <option value="London, UK" />
                      <option value="Tokyo, Japan" />
                      <option value="Paris, France" />
                      <option value="Sydney, Australia" />
                      <option value="Berlin, Germany" />
                      <option value="Toronto, Canada" />
                    </datalist>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, Apt 4B"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={updateProfile.isPending || isUploading}
        >
          {updateProfile.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
