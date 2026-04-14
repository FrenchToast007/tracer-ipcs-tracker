import { supabase, APP_STATE_ID } from './supabase';
import useAppStore from '@/store/useAppStore';

// ============================================================================
// Cloud sync layer
//
// How it works:
//   1. On login, call `hydrateFromCloud()` once to pull the shared app_state
//      row from Supabase and merge it into the Zustand store.
//   2. Call `startCloudSync()` to (a) subscribe to realtime updates so other
//      users' changes flow into this client, and (b) watch the store for local
//      changes and push them back (debounced).
//   3. On logout, call `stopCloudSync()` to tear everything down.
// ============================================================================

type Unsub = () => void;

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let unsubStore: Unsub | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false; // guard: don't echo remote updates back
let lastPushedSerialized = '';

// The slice of the Zustand store we actually sync. We skip `currentUser`
// because that is per-device session state.
function getSyncedSlice() {
  const s = useAppStore.getState();
  return {
    stages: s.stages,
    notes: s.notes,
  };
}

export async function hydrateFromCloud(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('id', APP_STATE_ID)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[cloudSync] hydrate error', error);
      return { ok: false, error: error.message };
    }

    if (!data || !data.data || Object.keys(data.data).length === 0) {
      // No cloud state yet — push the current local state so everyone starts
      // from the same seed.
      const slice = getSyncedSlice();
      lastPushedSerialized = JSON.stringify(slice);
      await supabase
        .from('app_state')
        .upsert({ id: APP_STATE_ID, data: slice, updated_at: new Date().toISOString() });
      return { ok: true };
    }

    // Apply remote state to the store
    applyingRemote = true;
    try {
      useAppStore.setState((prev) => ({
        ...prev,
        stages: data.data.stages ?? prev.stages,
        notes: data.data.notes ?? prev.notes,
      }));
      lastPushedSerialized = JSON.stringify(getSyncedSlice());
    } finally {
      applyingRemote = false;
    }

    return { ok: true };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[cloudSync] hydrate exception', e);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

function schedulePush() {
  if (applyingRemote) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    const slice = getSyncedSlice();
    const serialized = JSON.stringify(slice);
    if (serialized === lastPushedSerialized) return;
    lastPushedSerialized = serialized;

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('app_state')
      .upsert({
        id: APP_STATE_ID,
        data: slice,
        updated_at: new Date().toISOString(),
        updated_by: userData?.user?.id ?? null,
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[cloudSync] push error', error);
    }
  }, 800);
}

export function startCloudSync(): void {
  stopCloudSync();

  // Subscribe to realtime changes on the shared row
  realtimeChannel = supabase
    .channel('app_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state',
        filter: `id=eq.${APP_STATE_ID}`,
      },
      (payload: any) => {
        const next = payload?.new?.data;
        if (!next) return;
        const incomingSerialized = JSON.stringify({
          stages: next.stages ?? [],
          notes: next.notes ?? [],
        });
        if (incomingSerialized === lastPushedSerialized) return;
        applyingRemote = true;
        try {
          useAppStore.setState((prev) => ({
            ...prev,
            stages: next.stages ?? prev.stages,
            notes: next.notes ?? prev.notes,
          }));
          lastPushedSerialized = incomingSerialized;
        } finally {
          applyingRemote = false;
        }
      }
    )
    .subscribe();

  // Push local changes up whenever the relevant slice changes
  unsubStore = useAppStore.subscribe((state, prevState) => {
    if (
      state.stages !== (prevState as any).stages ||
      state.notes !== (prevState as any).notes
    ) {
      schedulePush();
    }
  });
}

export function stopCloudSync(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (unsubStore) {
    unsubStore();
    unsubStore = null;
  }
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  lastPushedSerialized = '';
}
