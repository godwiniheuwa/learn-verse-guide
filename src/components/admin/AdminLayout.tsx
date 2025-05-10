
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Users, BookOpen, FileText, Settings, 
  LogOut, Menu, X, ChevronRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config';
import { AnimatePresence, motion } from 'framer-motion';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <NavLink 
        to={to}
        className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-primary text-primary-foreground font-medium' 
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
        {sidebarOpen && <span>{label}</span>}
      </NavLink>
    );
  };
  
  const NavGroup = ({ 
    label, 
    icon: Icon, 
    children 
  }: { 
    label: string; 
    icon: any; 
    children: React.ReactNode 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="py-1">
        <button
          className="flex items-center justify-between w-full p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && <span>{label}</span>}
          </div>
          {sidebarOpen && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {sidebarOpen && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-10 overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -280 } : false}
            transition={{ duration: 0.2 }}
            className={`${
              sidebarOpen ? 'w-64' : 'w-16'
            } bg-card shadow-md z-30 flex flex-col ${
              isMobile ? 'fixed h-full' : 'relative'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-4 border-b">
              {sidebarOpen && <h1 className="text-xl font-bold">{APP_NAME}</h1>}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-muted"
              >
                {sidebarOpen ? <X /> : <Menu />}
              </Button>
            </div>
            
            {/* Sidebar Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <NavItem to="/admin" icon={Home} label="Dashboard" />
              
              <NavGroup icon={Users} label="Users">
                <NavItem to="/admin/users" icon={Users} label="All Users" />
                <NavItem to="/admin/users/new" icon={Users} label="Add User" />
              </NavGroup>
              
              <NavGroup icon={BookOpen} label="Exams">
                <NavItem to="/admin/exams" icon={BookOpen} label="All Exams" />
                <NavItem to="/admin/exams/new" icon={BookOpen} label="Create Exam" />
              </NavGroup>
              
              <NavGroup icon={FileText} label="Questions">
                <NavItem to="/admin/questions" icon={FileText} label="All Questions" />
                <NavItem to="/admin/questions/new" icon={FileText} label="Add Question" />
              </NavGroup>
              
              <NavItem to="/admin/settings" icon={Settings} label="Settings" />
            </nav>
            
            {/* Sidebar Footer */}
            <div className={`p-4 border-t ${sidebarOpen ? '' : 'flex justify-center'}`}>
              {sidebarOpen ? (
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                  <Button 
                    variant="ghost" 
                    className="mt-2 flex justify-start px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card shadow-sm p-4 flex justify-between items-center z-10">
          {(!sidebarOpen || isMobile) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-muted mr-2"
            >
              <Menu />
            </Button>
          )}
          <div className="text-lg font-semibold">
            Admin Panel
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden md:inline-block">
              {user?.name}
            </span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
