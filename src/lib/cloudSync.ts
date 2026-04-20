import { supabase, APP_STATE_ID } from './supabase';
import useAppStore, { INITIAL_STAGES } from '@/store/useAppStore';
import type { Stage } from '@/data/types';

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

// ---------------------------------------------------------------------------
// Stage self-healing
//
// The cloud row is a snapshot of the whole `stages` array. Once it is seeded
// from the initial data, later code changes to stage content never reach
// users because hydrate just overwrites local with cloud.
//
// To let new stage content (new activities, copy fixes, added weeks) flow to
// production without hand-editing the Supabase row, we merge on hydrate:
// if a cloud stage shows NO user progress (nothing done/in-progress/blocked,
// no KPIs filled, no exit criteria met, not signed off), we replace that
// stage with the local INITIAL_STAGES version. Stages with any user
// activity are left exactly as they are in the cloud.
// ---------------------------------------------------------------------------

function hasAnyProgress(stage: Stage): boolean {
  if (!stage) return false;
  if (stage.signedOffAt) return true;
  if (stage.status === 'complete') return true;
  for (const week of stage.weeks ?? []) {
    for (const a of week.activities ?? []) {
      if (a.status && a.status !== 'pending') return true;
      if (a.notes && a.notes.trim().length > 0) return true;
      if (a.completedAt) return true;
    }
    if (week.reviewData?.submitted) return true;
  }
  for (const kpi of stage.kpis ?? []) {
    const wv = kpi.weeklyValues ?? {};
    if (Object.values(wv).some((v) => v !== undefined && v !== null)) return true;
  }
  for (const ec of stage.exitCriteria ?? []) {
    if (ec.met) return true;
    if (ec.notes && ec.notes.trim().length > 0) return true;
  }
  // Ancillary collections — if anyone has added photos, red tags, huddle
  // logs, maintenance tags, supplies progress, etc., preserve cloud.
  if ((stage.photos ?? []).length > 0) return true;
  if ((stage.redTags ?? []).length > 0) return true;
  if ((stage.maintenanceTags ?? []).length > 0) return true;
  if ((stage.huddleLogs ?? []).length > 0) return true;
  if ((stage.supplies ?? []).some((s) => s.ordered || s.acquired)) return true;
  if ((stage.fiveSZones ?? []).some((z) => Object.keys(z.weeklyScores ?? {}).length > 0)) {
    return true;
  }
  return false;
}

function mergeStagesWithInitial(cloudStages: Stage[] | undefined): Stage[] {
  const cloudById = new Map<string, Stage>((cloudStages ?? []).map((s) => [s.id, s]));
  const merged = INITIAL_STAGES.map((local) => {
    const cloud = cloudById.get(local.id);
    if (!cloud) return local;
    return hasAnyProgress(cloud) ? cloud : local;
  });
  // Also carry forward any cloud-only stages we don't know about locally
  // (defensive — shouldn't happen in practice).
  for (const cloud of cloudStages ?? []) {
    if (!merged.some((s) => s.id === cloud.id)) {
      merged.push(cloud);
    }
  }
  return merged;
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

    // Apply remote state to the store, merging INITIAL_STAGES into any cloud
    // stage that has no user progress yet (see mergeStagesWithInitial).
    const mergedStages = mergeStagesWithInitial(data.data.stages);
    applyingRemote = true;
    try {
      useAppStore.setState((prev) => ({
        ...prev,
        stages: mergedStages,
        notes: data.data.notes ?? prev.notes,
      }));
      lastPushedSerialized = JSON.stringify(getSyncedSlice());
    } finally {
      applyingRemote = false;
    }

    // If the merge changed anything (new stage content flowed in), push the
    // corrected state back so every other client converges on the new seed.
    const cloudSerialized = JSON.stringify({
      stages: data.data.stages ?? [],
      notes: data.data.notes ?? [],
    });
    if (lastPushedSerialized !== cloudSerialized) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase
        .from('app_state')
        .upsert({
          id: APP_STATE_ID,
          data: { stages: mergedStages, notes: data.data.notes ?? [] },
          updated_at: new Date().toISOString(),
          updated_by: userData?.user?.id ?? null,
        });
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
