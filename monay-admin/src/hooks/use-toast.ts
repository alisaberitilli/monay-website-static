import toast from 'react-hot-toast';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const showToast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = description ? `${title}: ${description}` : title;

    if (variant === 'destructive') {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } else {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
    }
  };

  return {
    toast: showToast,
  };
}