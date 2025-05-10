
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleUser, FileText, BookOpen, CheckSquare } from "lucide-react";
import { API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';

type DashboardStats = {
  users: number;
  questions: number;
  exams: number;
  subjects: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    questions: 0,
    exams: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, this would fetch actual stats from the backend
    // For now, we'll simulate it with a timeout
    const timer = setTimeout(() => {
      setStats({
        users: 32,
        questions: 156,
        exams: 14,
        subjects: 8
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animation classes for cards
  const cardClasses = "transition-all duration-300 transform hover:scale-105";
  
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    loading 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    description: string; 
    loading: boolean;
  }) => (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your exam preparation platform.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={CircleUser}
          description="Active users on the platform"
          loading={loading}
        />
        <StatCard
          title="Questions"
          value={stats.questions}
          icon={FileText}
          description="Questions in the database"
          loading={loading}
        />
        <StatCard
          title="Exams"
          value={stats.exams}
          icon={BookOpen}
          description="Published exam papers"
          loading={loading}
        />
        <StatCard
          title="Subjects"
          value={stats.subjects}
          icon={CheckSquare}
          description="Available subject areas"
          loading={loading}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md mb-2" />
              ))
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New user registration</span>
                  <span>2 minutes ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exam "Math 101" published</span>
                  <span>1 hour ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New question added</span>
                  <span>3 hours ago</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md mb-2" />
              ))
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Server Status</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Database</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Uptime</span>
                    <span>99.9%</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
