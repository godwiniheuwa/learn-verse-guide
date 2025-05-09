
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasPermission, ResourceOperation } from '@/middleware/role-guard';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: 'student' | 'teacher' | 'examiner' | 'admin';
  fallback?: ReactNode;
}

export const RoleGuard = ({ children, requiredRole, fallback = null }: RoleGuardProps) => {
  const { user } = useAuth();
  
  if (!hasRole(user, requiredRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

interface PermissionGuardProps {
  children: ReactNode;
  resource: 'exams' | 'questions' | 'users';
  operation: ResourceOperation;
  fallback?: ReactNode;
}

export const PermissionGuard = ({ 
  children, 
  resource, 
  operation, 
  fallback = null 
}: PermissionGuardProps) => {
  const { user } = useAuth();
  
  if (!hasPermission(user, resource, operation)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default { RoleGuard, PermissionGuard };
