
import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  FileQuestion, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X,
  BarChart,
  FileText,
  Clock,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  // Auto-close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Questions', path: '/admin/questions', icon: <FileQuestion className="w-5 h-5" /> },
    { label: 'Exams', path: '/admin/exams', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart className="w-5 h-5" /> },
    { label: 'Documents', path: '/admin/documents', icon: <FileText className="w-5 h-5" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed z-30 lg:relative w-64 h-screen bg-white border-r border-gray-200 shadow-md`}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/90 text-white rounded-md p-1.5">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-800">ExamPrep</h1>
                </div>
                {isMobile && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              {/* User Profile */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src="/avatar-placeholder.png" alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@examprep.com'}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors group ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`mr-3 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {item.icon}
                        </span>
                        <motion.span
                          initial={false}
                          animate={isActive ? { x: 2 } : { x: 0 }}
                        >
                          {item.label}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              {/* Sidebar Footer */}
              <div className="p-4 border-t mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-700"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Clock className="w-5 h-5" />
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Today</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
