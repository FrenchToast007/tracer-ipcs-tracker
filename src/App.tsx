import { Route, Switch } from 'wouter';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { StageDetail } from '@/pages/StageDetail';
import { ExecutiveView } from '@/pages/ExecutiveView';
import { HealthCheck } from '@/pages/HealthCheck';
import { NotFound } from '@/pages/NotFound';
import { AuthGate } from '@/components/auth/AuthGate';

export default function App() {
  return (
    <AuthGate>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/stage/:id" component={StageDetail} />
          <Route path="/executive" component={ExecutiveView} />
          <Route path="/health-check" component={HealthCheck} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AppLayout>
    </AuthGate>
  );
}
