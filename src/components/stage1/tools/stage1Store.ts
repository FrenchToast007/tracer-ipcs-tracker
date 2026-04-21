// Tiny helper so the Stage 1 tool components can push updates into the
// Zustand store without every collection needing its own action. The cloud
// sync layer still picks these up because it watches `stages` as a whole.

// @ts-nocheck
import { useAppStore } from '@/store/useAppStore';
import type { Stage } from '@/data/types';

type StageField = keyof Stage;

export function updateStageArray<T = any>(
  stageId: string,
  field: StageField,
  updater: (current: T[]) => T[]
): void {
  useAppStore.setState((prev) => {
    const stages = prev.stages.map((s) => {
      if (s.id !== stageId) return s;
      const current = ((s as any)[field] as T[] | undefined) ?? [];
      return { ...s, [field]: updater(current) } as Stage;
    });
    return { stages };
  });
}

// Generate a short id for new rows. Not cryptographically random — just
// enough to avoid collisions inside a single stage.
export function newRowId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
