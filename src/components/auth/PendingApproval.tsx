import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PendingApprovalProps {
  email: string;
}

export function PendingApproval({ email }: PendingApprovalProps) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Waiting for approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">
            Your account <strong>{email}</strong> has been created but needs to
            be approved by an administrator before you can access the tracker.
          </p>
          <p className="text-sm text-slate-600">
            Ask the admin to flip your <code>approved</code> flag in Supabase,
            then refresh this page.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
