import { Spinner } from './Spinner';

interface LoaderProps {
  message?: string;
  fullPage?: boolean;
}

export const Loader = ({ 
  message = "Loading production data...", 
  fullPage = false 
}: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <Spinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-700 rounded-full animate-ping" />
        </div>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-950/40">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};
