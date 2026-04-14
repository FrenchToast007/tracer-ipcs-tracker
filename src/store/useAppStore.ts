// @ts-nocheck
import { create } from 'zustand';
import type {
  User,
  Stage,
  Photo,
  MaintenanceTag,
  HuddleLogEntry,
  RedTagItem,
  Note,
  ActivityStatus,
  FiveSScores,
  AppState,
  UserRole,
  PlantZone,
} from '../data/types';
import { INITIAL_STAGES as ALL_STAGES } from '../data/stageData';

// Demo users
export const DEMO_USERS: User[] = [
  { id: 'user-1', name: 'Abdel Benali', role: 'plantManager' },
  { id: 'user-2', name: 'Fatima Al-Rashid', role: 'ceo' },
  { id: 'user-3', name: 'Yuki Tanaka', role: 'cfo' },
  { id: 'user-4', name: 'James O\'Brien', role: 'projectManager' },
  { id: 'user-5', name: 'Maria Santos', role: 'siteManager' },
  { id: 'user-6', name: 'David Chen', role: 'consultant' },
];

// Role labels
export const ROLE_LABELS: Record<UserRole, string> = {
  plantManager: 'Plant Manager',
  ceo: 'CEO',
  cfo: 'CFO',
  projectManager: 'Project Manager',
  siteManager: 'Site Manager',
  consultant: 'Consultant',
};

// Role colors
export const ROLE_COLORS: Record<UserRole, string> = {
  plantManager: 'blue',
  ceo: 'purple',
  cfo: 'emerald',
  projectManager: 'amber',
  siteManager: 'rose',
  consultant: 'indigo',
};

// Initial stages data (stage0 + stages 1-7)
export const INITIAL_STAGES: Stage[] = ALL_STAGES;

interface AppStore extends AppState {
  login(user: User): void;
  logout(): void;
  updateActivityStatus(
    stageId: string,
    weekId: string,
    activityId: string,
    status: ActivityStatus
  ): void;
  updateActivityNotes(
    stageId: string,
    weekId: string,
    activityId: string,
    notes: string
  ): void;
  updateKPI(
    stageId: string,
    kpiId: string,
    weekKey: 'week1' | 'week2' | 'week3' | 'week4',
    value: number
  ): void;
  updateExitCriterion(
    stageId: string,
    criterionId: string,
    met: boolean,
    notes?: string
  ): void;
  signOffStage(stageId: string, signedBy: string): void;
  submitWeeklyReview(
    stageId: string,
    weekId: string,
    kpiValues: Record<string, number>,
    notes: string
  ): void;
  addPhoto(stageId: string, photo: Omit<Photo, 'id'>): void;
  removePhoto(stageId: string, photoId: string): void;
  addMaintenanceTag(stageId: string, tag: Omit<MaintenanceTag, 'id'>): void;
  updateMaintenanceTag(
    stageId: string,
    tagId: string,
    updates: Partial<MaintenanceTag>
  ): void;
  toggleSupplyItem(stageId: string, itemId: string): void;
  toggleSupplyOrdered(stageId: string, itemId: string): void;
  updateSupplyQuantity(stageId: string, itemId: string, qty: number): void;
  addHuddleLog(stageId: string, entry: Omit<HuddleLogEntry, 'id'>): void;
  addRedTag(stageId: string, tag: Omit<RedTagItem, 'id'>): void;
  disposeRedTag(
    stageId: string,
    tagId: string,
    disposition: 'discard' | 'relocate' | 'store'
  ): void;
  updatePlantZone(stageId: string, zoneId: string, updates: Partial<PlantZone>): void;
  scoreFiveSZoneWeek(
    stageId: string,
    zoneId: string,
    weekKey: string,
    scores: FiveSScores
  ): void;
  addNote(note: Omit<Note, 'id' | 'createdAt'>): void;
  deleteNote(noteId: string): void;
  getStageCompletionPercent(stageId: string): number;
  getOverallProgress(): number;
}

const calculateStageCompletion = (stage: Stage): number => {
  let totalActivities = 0;
  let doneActivities = 0;

  stage.weeks.forEach((week) => {
    week.activities.forEach((activity) => {
      totalActivities++;
      if (activity.status === 'done') {
        doneActivities++;
      }
    });
  });

  if (totalActivities === 0) return 0;
  return Math.round((doneActivities / totalActivities) * 100);
};

export const useAppStore = create<AppStore>()(
  (set, get) => ({
      currentUser: DEMO_USERS[0],
      stages: INITIAL_STAGES,
      notes: [],

      login: (user: User) => {
        set({ currentUser: user });
      },

      logout: () => {
        set({ currentUser: null });
      },

      updateActivityStatus: (
        stageId: string,
        weekId: string,
        activityId: string,
        status: ActivityStatus
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const weeks = stage.weeks.map((week) => {
              if (week.id !== weekId) return week;

              const activities = week.activities.map((activity) => {
                if (activity.id !== activityId) return activity;

                const now = new Date().toISOString();
                return {
                  ...activity,
                  status,
                  completedAt: status === 'done' ? now : undefined,
                };
              });

              return { ...week, activities };
            });

            const completionPercent = calculateStageCompletion({
              ...stage,
              weeks,
            });

            return { ...stage, weeks, completionPercent };
          });

          return { stages };
        });
      },

      updateActivityNotes: (
        stageId: string,
        weekId: string,
        activityId: string,
        notes: string
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const weeks = stage.weeks.map((week) => {
              if (week.id !== weekId) return week;

              const activities = week.activities.map((activity) => {
                if (activity.id !== activityId) return activity;
                return { ...activity, notes };
              });

              return { ...week, activities };
            });

            return { ...stage, weeks };
          });

          return { stages };
        });
      },

      updateKPI: (
        stageId: string,
        kpiId: string,
        weekKey: 'week1' | 'week2' | 'week3' | 'week4',
        value: number
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const kpis = stage.kpis.map((kpi) => {
              if (kpi.id !== kpiId) return kpi;

              return {
                ...kpi,
                weeklyValues: {
                  ...kpi.weeklyValues,
                  [weekKey]: value,
                },
              };
            });

            return { ...stage, kpis };
          });

          return { stages };
        });
      },

      updateExitCriterion: (
        stageId: string,
        criterionId: string,
        met: boolean,
        notes?: string
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const exitCriteria = stage.exitCriteria.map((criterion) => {
              if (criterion.id !== criterionId) return criterion;

              return {
                ...criterion,
                met,
                notes: notes ?? criterion.notes,
              };
            });

            return { ...stage, exitCriteria };
          });

          return { stages };
        });
      },

      signOffStage: (stageId: string, signedBy: string) => {
        set((state) => {
          const now = new Date().toISOString();
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            return {
              ...stage,
              signedOffAt: now,
              signedOffBy: signedBy,
              status: 'complete' as const,
              completionPercent: 100,
            };
          });

          return { stages };
        });
      },

      submitWeeklyReview: (
        stageId: string,
        weekId: string,
        kpiValues: Record<string, number>,
        notes: string
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const weeks = stage.weeks.map((week) => {
              if (week.id !== weekId) return week;

              return {
                ...week,
                reviewData: {
                  submitted: true,
                  kpiValues,
                  notes,
                  submittedAt: new Date().toISOString(),
                  submittedBy: get().currentUser?.name ?? 'Unknown',
                },
              };
            });

            return { ...stage, weeks };
          });

          return { stages };
        });
      },

      addPhoto: (stageId: string, photo: Omit<Photo, 'id'>) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const photos = [
              ...(stage.photos ?? []),
              {
                ...photo,
                id: crypto.randomUUID(),
              },
            ];

            return { ...stage, photos };
          });

          return { stages };
        });
      },

      removePhoto: (stageId: string, photoId: string) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const photos = (stage.photos ?? []).filter((p) => p.id !== photoId);

            return { ...stage, photos };
          });

          return { stages };
        });
      },

      addMaintenanceTag: (stageId: string, tag: Omit<MaintenanceTag, 'id'>) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const maintenanceTags = [
              ...(stage.maintenanceTags ?? []),
              {
                ...tag,
                id: crypto.randomUUID(),
              },
            ];

            return { ...stage, maintenanceTags };
          });

          return { stages };
        });
      },

      updateMaintenanceTag: (
        stageId: string,
        tagId: string,
        updates: Partial<MaintenanceTag>
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const maintenanceTags = (stage.maintenanceTags ?? []).map((tag) => {
              if (tag.id !== tagId) return tag;

              const updatedTag = { ...tag, ...updates };

              if (updates.resolved && !tag.resolvedAt) {
                updatedTag.resolvedAt = new Date().toISOString();
              }

              return updatedTag;
            });

            return { ...stage, maintenanceTags };
          });

          return { stages };
        });
      },

      toggleSupplyItem: (stageId: string, itemId: string) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const supplies = (stage.supplies ?? []).map((item) => {
              if (item.id !== itemId) return item;

              return { ...item, acquired: !item.acquired };
            });

            return { ...stage, supplies };
          });

          return { stages };
        });
      },

      toggleSupplyOrdered: (stageId: string, itemId: string) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const supplies = (stage.supplies ?? []).map((item) => {
              if (item.id !== itemId) return item;
              return { ...item, ordered: !item.ordered };
            });

            return { ...stage, supplies };
          });

          return { stages };
        });
      },

      updateSupplyQuantity: (stageId: string, itemId: string, qty: number) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const supplies = (stage.supplies ?? []).map((item) => {
              if (item.id !== itemId) return item;

              return { ...item, quantity: qty };
            });

            return { ...stage, supplies };
          });

          return { stages };
        });
      },

      addHuddleLog: (stageId: string, entry: Omit<HuddleLogEntry, 'id'>) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const huddleLogs = [
              ...(stage.huddleLogs ?? []),
              {
                ...entry,
                id: crypto.randomUUID(),
              },
            ];

            return { ...stage, huddleLogs };
          });

          return { stages };
        });
      },

      addRedTag: (stageId: string, tag: Omit<RedTagItem, 'id'>) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const redTags = [
              ...(stage.redTags ?? []),
              {
                ...tag,
                id: crypto.randomUUID(),
              },
            ];

            return { ...stage, redTags };
          });

          return { stages };
        });
      },

      disposeRedTag: (
        stageId: string,
        tagId: string,
        disposition: 'discard' | 'relocate' | 'store'
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const redTags = (stage.redTags ?? []).map((tag) => {
              if (tag.id !== tagId) return tag;

              return {
                ...tag,
                disposition,
                disposedAt: new Date().toISOString(),
              };
            });

            return { ...stage, redTags };
          });

          return { stages };
        });
      },

      updatePlantZone: (
        stageId: string,
        zoneId: string,
        updates: Partial<PlantZone>
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const plantZones = (stage.plantZones ?? []).map((zone) => {
              if (zone.id !== zoneId) return zone;

              return { ...zone, ...updates };
            });

            return { ...stage, plantZones };
          });

          return { stages };
        });
      },

      scoreFiveSZoneWeek: (
        stageId: string,
        zoneId: string,
        weekKey: string,
        scores: FiveSScores
      ) => {
        set((state) => {
          const stages = state.stages.map((stage) => {
            if (stage.id !== stageId) return stage;

            const fiveSZones = (stage.fiveSZones ?? []).map((zone) => {
              if (zone.id !== zoneId) return zone;

              return {
                ...zone,
                weeklyScores: {
                  ...zone.weeklyScores,
                  [weekKey]: scores,
                },
              };
            });

            return { ...stage, fiveSZones };
          });

          return { stages };
        });
      },

      addNote: (note: Omit<Note, 'id' | 'createdAt'>) => {
        set((state) => {
          const newNote: Note = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };

          return {
            notes: [...state.notes, newNote],
          };
        });
      },

      deleteNote: (noteId: string) => {
        set((state) => {
          const notes = state.notes.filter((n) => n.id !== noteId);

          return { notes };
        });
      },

      getStageCompletionPercent: (stageId: string): number => {
        const stage = get().stages.find((s) => s.id === stageId);
        if (!stage) return 0;

        return calculateStageCompletion(stage);
      },

      getOverallProgress: (): number => {
        const stages = get().stages;
        if (stages.length === 0) return 0;

        const totalCompletion = stages.reduce((sum, stage) => {
          return sum + calculateStageCompletion(stage);
        }, 0);

        return Math.round(totalCompletion / stages.length);
      },
    })
);

export default useAppStore;
