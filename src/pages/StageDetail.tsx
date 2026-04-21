// @ts-nocheck
import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Stage0GuidedFlow } from '@/components/stage0/Stage0GuidedFlow';
import { Stage1GuidedFlow } from '@/components/stage1/Stage1GuidedFlow';
import { StageGuidedFlow } from '@/components/shared/StageGuidedFlow';
import { STAGE_FLOW_CONFIGS } from '@/components/shared/stageFlowConfigs';
import { KPITracker } from '@/components/KPITracker';
import { ExitCriteria } from '@/components/ExitCriteria';
import { FiveSScoring } from '@/components/FiveSScoring';
import { NotesPanel } from '@/components/NotesPanel';
import { WeeklyReview } from '@/components/WeeklyReview';

export function StageDetail() {
  const [, params] = useRoute('/stage/:id');
  const [, navigate] = useLocation();
  const stages = useAppStore((state) => state.stages);
  const currentUser = useAppStore((state) => state.currentUser);
  const updateActivityStatus = useAppStore((state) => state.updateActivityStatus);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const stageId = params?.id;
  const stage = stages.find((s) => s.id === stageId);

  if (!stage) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col items-center justify-center py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Stage Not Found
            </h1>
            <p className="text-slate-600 mb-6">
              The stage you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if stage is locked
  if (stage.status === 'locked') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-slate-100 rounded-full mb-6">
              <Lock className="w-12 h-12 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Stage Locked
            </h1>
            <p className="text-slate-600 mb-6 text-center max-w-md">
              Complete the previous stage to unlock this one
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if user can edit
  const canEdit =
    currentUser && !['ceo', 'cfo'].includes(currentUser.role);

  // Stage 0 - Guided Flow
  if (stage.id === 'stage0') {
    return <Stage0GuidedFlow stageId={stage.id} />;
  }

  // Stage 1 - Guided Flow (mirrors Stage 0's click-to-expand pattern,
  // without the 5S-specific tool panels)
  if (stage.id === 'stage1') {
    return <Stage1GuidedFlow stageId={stage.id} />;
  }

  // Stages 2-7 - config-driven StageGuidedFlow
  const extendedConfig = STAGE_FLOW_CONFIGS[stage.id];
  if (extendedConfig) {
    return <StageGuidedFlow stageId={stage.id} config={extendedConfig} />;
  }

  // Fallback - Tabbed Layout (should no longer be reached)
  const selectedWeekData = stage.weeks.find((w) => w.number === selectedWeek);

  // Group activities by day
  const activitiesByDay = selectedWeekData
    ? selectedWeekData.activities.reduce(
        (acc, activity) => {
          const day = activity.day;
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(activity);
          return acc;
        },
        {} as Record<string, typeof selectedWeekData.activities>
      )
    : {};

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const sortedDays = Object.keys(activitiesByDay).sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Stage Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="mb-3">{stage.status.toUpperCase()}</Badge>
              <h1 className="text-3xl font-bold text-slate-900">
                Stage {stage.number}: {stage.title}
              </h1>
              {stage.subtitle && (
                <p className="text-lg text-slate-600 mt-1">{stage.subtitle}</p>
              )}
              <p className="text-slate-600 mt-2">{stage.description}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 lg:grid-cols-6 w-full">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="kpis">KPI Tracker</TabsTrigger>
            <TabsTrigger value="exitcriteria">Exit Criteria</TabsTrigger>
            <TabsTrigger value="5sscoring">5S Scoring</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="weeklyreview">Weekly Review</TabsTrigger>
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            {/* Week Selector */}
            <div className="flex gap-2 flex-wrap">
              {stage.weeks.map((week) => (
                <Button
                  key={week.id}
                  variant={selectedWeek === week.number ? 'default' : 'outline'}
                  onClick={() => setSelectedWeek(week.number)}
                >
                  Week {week.number}
                </Button>
              ))}
            </div>

            {selectedWeekData && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {selectedWeekData.theme}
                  </h3>
                  <p className="text-slate-600">{selectedWeekData.focus}</p>
                </div>

                {/* Activities by Day */}
                {sortedDays.length > 0 ? (
                  <div className="space-y-4">
                    {sortedDays.map((day) => (
                      <Card key={day}>
                        <CardHeader className="pb-3">
                          <h4 className="font-semibold text-slate-900">
                            {day}
                          </h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {activitiesByDay[day].map((activity) => (
                            <ActivityRow
                              key={activity.id}
                              activity={activity}
                              stageId={stage.id}
                              weekId={selectedWeekData.id}
                              canEdit={canEdit ?? false}
                              updateActivityStatus={updateActivityStatus}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No activities for this week
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* KPI Tracker Tab */}
          <TabsContent value="kpis">
            <KPITracker
              stageId={stage.id}
              kpis={stage.kpis}
              canEdit={canEdit ?? false}
              color={stage.color}
            />
          </TabsContent>

          {/* Exit Criteria Tab */}
          <TabsContent value="exitcriteria">
            <ExitCriteria
              stageId={stage.id}
              criteria={stage.exitCriteria}
              canEdit={canEdit ?? false}
              color={stage.color}
            />
          </TabsContent>

          {/* 5S Scoring Tab */}
          <TabsContent value="5sscoring">
            <FiveSScoring stageId={stage.id} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <NotesPanel stageId={stage.id} />
          </TabsContent>

          {/* Weekly Review Tab */}
          <TabsContent value="weeklyreview">
            {selectedWeekData && (
              <WeeklyReview
                stageId={stage.id}
                week={selectedWeekData}
                kpis={stage.kpis}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface ActivityRowProps {
  activity: any;
  stageId: string;
  weekId: string;
  canEdit: boolean;
  updateActivityStatus: (stageId: string, weekId: string, activityId: string, status: any) => void;
}

function ActivityRow({
  activity,
  stageId,
  weekId,
  canEdit,
  updateActivityStatus,
}: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-slate-900">{activity.description}</p>
          <p className="text-sm text-slate-600 mt-1">
            Owner: {activity.owner}
          </p>
          {activity.deliverable && (
            <p className="text-sm text-slate-600">
              Deliverable: {activity.deliverable}
            </p>
          )}
        </div>

        {canEdit && (
          <select
            value={activity.status}
            onChange={(e) =>
              updateActivityStatus(
                stageId,
                weekId,
                activity.id,
                e.target.value as any
              )
            }
            className={`px-3 py-1 rounded text-sm font-medium cursor-pointer border-0 ${getStatusColor(
              activity.status
            )}`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        )}

        {!canEdit && (
          <Badge className={getStatusColor(activity.status)}>
            {activity.status.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      {activity.notes && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Hide' : 'Show'} Notes
          </button>
          {expanded && (
            <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
              {activity.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
