
import { User } from '@/types/auth';

// Role hierarchy (higher roles include permissions of lower roles)
const roleHierarchy: Record<string, number> = {
  'student': 0,
  'teacher': 1,
  'examiner': 2,
  'admin': 3
};

// Type for allowed operations based on role
export type ResourceOperation = 'view' | 'create' | 'update' | 'delete';

// Check if user has the required role or higher
export const hasRole = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false;
  
  const userRoleLevel = roleHierarchy[user.role] ?? -1;
  const requiredRoleLevel = roleHierarchy[requiredRole] ?? -1;
  
  return userRoleLevel >= requiredRoleLevel;
};

// Permission check for specific operations
export const hasPermission = (
  user: User | null,
  resource: 'exams' | 'questions' | 'users',
  operation: ResourceOperation
): boolean => {
  if (!user) return false;
  
  // Admin has full access to everything
  if (user.role === 'admin') return true;
  
  // Permission matrix based on our Supabase RLS policies
  const permissions: Record<string, Record<string, ResourceOperation[]>> = {
    student: {
      exams: ['view'],
      questions: ['view'],
      users: []
    },
    teacher: {
      exams: ['view'],
      questions: ['view', 'create', 'update'],
      users: []
    },
    examiner: {
      exams: ['view', 'create', 'update'],
      questions: ['view', 'create', 'update'],
      users: []
    },
    admin: {
      exams: ['view', 'create', 'update', 'delete'],
      questions: ['view', 'create', 'update', 'delete'],
      users: ['view', 'create', 'update', 'delete']
    }
  };

  return permissions[user.role]?.[resource]?.includes(operation) || false;
};

// Check if a user can access a specific route
export const canAccessRoute = (
  user: User | null,
  route: string
): boolean => {
  if (!user) {
    // Non-authenticated users can only access public routes
    return ['/', '/login', '/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/activate'].includes(route);
  }

  // Public routes accessible by all authenticated users
  if (['/', '/dashboard'].includes(route)) {
    return true;
  }

  // Role-specific route access
  if (route.startsWith('/admin')) {
    return hasRole(user, 'admin');
  }

  if (route.startsWith('/exams/create') || route.startsWith('/exams/edit')) {
    return hasRole(user, 'examiner');
  }

  if (route.startsWith('/exams')) {
    // Read-only access for all users
    return true;
  }

  if (route.startsWith('/questions/create') || route.startsWith('/questions/edit')) {
    return hasRole(user, 'teacher');
  }

  // Default: allow access if we don't have a specific rule
  return true;
};
