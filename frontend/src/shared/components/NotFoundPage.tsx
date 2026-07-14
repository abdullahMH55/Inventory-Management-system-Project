import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes';
import { Button } from '@/shared/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="numeric text-sm text-muted-foreground">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
        <Button
          variant="outline"
          className="mt-6"
          render={<Link to={ROUTES.dashboard} />}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
