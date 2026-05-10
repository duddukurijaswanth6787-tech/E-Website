import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again later.",
  onRetry
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-red-50/30 rounded-3xl border border-red-100">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button 
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
