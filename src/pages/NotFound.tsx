import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="p-4 bg-red-100 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-xl text-slate-600 mb-2">Page not found</p>
          <p className="text-slate-500">
            The page you're looking for doesn't exist. It may have been moved or deleted.
          </p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="mt-4"
          size="lg"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
