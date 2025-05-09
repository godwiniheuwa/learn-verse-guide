
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessageProps {
  type?: AlertType;
  title: string;
  message: string;
  show?: boolean;
  autoHide?: boolean;
  hideAfter?: number;
  onHide?: () => void;
}

export function AlertMessage({
  type = 'info',
  title,
  message,
  show = true,
  autoHide = false,
  hideAfter = 5000,
  onHide
}: AlertMessageProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onHide) onHide();
      }, hideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, visible, hideAfter, onHide]);

  if (!visible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const alertClasses = {
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  };

  return (
    <Alert className={cn('mb-4', alertClasses[type])}>
      <div className="flex items-start">
        {icons[type]}
        <div className="ml-3">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
