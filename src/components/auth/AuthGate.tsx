import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type UserProfile } from '@/lib/supabase';
import { hydrateFromCloud, startCloudSync, stopCloudSync } from '@/lib/cloudSync';
import { LoginScreen } from './LoginScreen';
import { PendingApproval } from './PendingApproval';

interface AuthGateProps {
  children: React.ReactNode;
}

type Status =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'pending'; profile: UserProfile | null; email: string }
  | { kind: 'approved'; profile: UserProfile };

export function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  async function evaluateSession(session: Session | null) {
    if (!session?.user) {
      stopCloudSync();
      setStatus({ kind: 'signedOut' });
      return;
    }

    // Look up profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[AuthGate] profile fetch error', error);
    }

    if (!profile || !profile.approved) {
      stopCloudSync();
      setStatus({
        kind: 'pending',
        profile: (profile as UserProfile) ?? null,
        email: session.user.email ?? '',
      });
      return;
    }

    // Approved — hydrate shared data then start realtime sync
    await hydrateFromCloud();
    startCloudSync();
    setStatus({ kind: 'approved', profile: profile as UserProfile });
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      evaluateSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      evaluateSession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      stopCloudSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status.kind === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading…</div>
      </div>
    );
  }

  if (status.kind === 'signedOut') {
    return <LoginScreen />;
  }

  if (status.kind === 'pending') {
    return <PendingApproval email={status.email} />;
  }

  return <>{children}</>;
}
