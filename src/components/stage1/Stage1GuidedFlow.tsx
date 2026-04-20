// @ts-nocheck
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ActivityDetailCard } from '@/components/stage0/ActivityDetailCard';
import { CrossRefChip } from '@/components/stage0/CrossRefChip';
import { ReferenceDrawer } from '@/components/stage0/ReferenceDrawer';

interface Stage1GuidedFlowProps {
  stageId: string;
}

/**
 * Stage 1 detail page — mirrors Stage 0's click-into-activity pattern.
 *
 * Structure:
 *   1. Header with progress + tasks counters.
 *   2. Audit References panel (SOP / Finding / Rec chips that open a drawer).
 *   3. Week selector (1..N) with per-week progress counts.
 *   4. Active week banner.
 *   5. Day-by-day expandable sections — each day opens to reveal the
 *      ActivityDetailCard for every task scheduled that day, with the same
 *      "click the checkbox to mark done, expand to see steps / success
 *      criteria / common mistakes" affordances as Stage 0.
 *
 * Stage 0's 5S-specific tool panels (zones, supplies, red tags, maintenance,
 * 5S scoring, photo upload, huddle log) are deliberately omitted — Stage 1 is
 * a governance/documentation stage and those tools don't apply.
 */
export const Stage1GuidedFlow: React.FC<Stage1GuidedFlowProps> = ({
  stageId,
}) => {
  const [, navigate] = useLocation();
  const stages = useAppStore((state) => state.stages);
  const currentUser = useAppStore((state) => state.currentUser);
  const updateActivityStatus = useAppStore(
    (state) => state.updateActivityStatus
  );

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [referenceDrawerOpen, setReferenceDrawerOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<
    'sop' | 'finding' | 'rec' | null
  >(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const stage = stages.find((s) => s.id === stageId);

  if (!stage) {
    return (
      <div className="p-8 text-center text-slate-600">Stage not found</div>
    );
  }

  const canEdit =
    currentUser && !['ceo', 'cfo'].includes(currentUser.role);

  // Progress counters across the whole stage
  const totalActivities = stage.weeks.reduce(
    (sum, week) => sum + week.activities.length,
    0
  );
  const completedActivities = stage.weeks.reduce(
    (sum, week) =>
      sum + week.activities.filter((a) => a.status === 'done').length,
    0
  );
  const completionPercent =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

  const selectedWeekData = stage.weeks.find(
    (w) => w.number === selectedWeek
  );

  const toggleDay = (day: string) => {
    const next = new Set(expandedDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setExpandedDays(next);
  };

  // Group activities by their `day` label
  const activitiesByDay = selectedWeekData
    ? selectedWeekData.activities.reduce(
        (acc, activity) => {
          const day = activity.day;
          if (!acc[day]) acc[day] = [];
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
  const dayIndex = (label: string): number => {
    const firstDay = label.split(/[-/–—]/)[0].trim();
    const idx = dayOrder.indexOf(firstDay);
    return idx === -1 ? dayOrder.length : idx;
  };
  const sortedDays = Object.keys(activitiesByDay).sort(
    (a, b) => dayIndex(a) - dayIndex(b)
  );

  const handleOpenReference = (
    type: 'sop' | 'finding' | 'rec',
    id: string
  ) => {
    setReferenceType(type);
    setReferenceId(id);
    setReferenceDrawerOpen(true);
  };

  const handleUpdateActivityStatus = (
    activityId: string,
    status: string
  ) => {
    if (!selectedWeekData) return;
    updateActivityStatus(
      stageId,
      selectedWeekData.id,
      activityId,
      status as any
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {stage.title}
              </h1>
              {stage.subtitle && (
                <p className="text-slate-600 mt-2">{stage.subtitle}</p>
              )}
            </div>
          </div>
          {stage.description && (
            <p className="text-slate-700 mt-4 max-w-4xl">
              {stage.description}
            </p>
          )}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {completionPercent}%
              </p>
              <p className="text-sm text-slate-600">Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {completedActivities}/{totalActivities}
              </p>
              <p className="text-sm text-slate-600">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {stage.weeks.length}
              </p>
              <p className="text-sm text-slate-600">Weeks</p>
            </div>
          </div>
        </div>

        {/* Audit References Panel */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-base text-purple-900">
                      Audit References
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4">
                  Key audit references that guide Stage 1 work. Click any item
                  to view full content.
                </p>
                <div className="flex flex-wrap gap-2">
                  <CrossRefChip
                    type="sop"
                    id="SOP-23"
                    label="SOP-23: Priority Rules & Dispatch"
                    onClick={() => handleOpenReference('sop', 'SOP-23')}
                  />
                  <CrossRefChip
                    type="sop"
                    id="SOP-24"
                    label="SOP-24: Escalation Ladder & Stop-the-Line"
                    onClick={() => handleOpenReference('sop', 'SOP-24')}
                  />
                  <CrossRefChip
                    type="sop"
                    id="SOP-38"
                    label="SOP-38: Integrated Production Control System"
                    onClick={() => handleOpenReference('sop', 'SOP-38')}
                  />
                  <CrossRefChip
                    type="finding"
                    id="E"
                    label="Finding E: Decision rights unclear"
                    onClick={() => handleOpenReference('finding', 'E')}
                  />
                  <CrossRefChip
                    type="finding"
                    id="D"
                    label="Finding D: Handoffs not controlled"
                    onClick={() => handleOpenReference('finding', 'D')}
                  />
                  <CrossRefChip
                    type="rec"
                    id="4.5"
                    label="Rec 4.5: Escalation ladder"
                    onClick={() => handleOpenReference('rec', '4.5')}
                  />
                  <CrossRefChip
                    type="rec"
                    id="4.0"
                    label="Rec 4.0: Guiding Principles"
                    onClick={() => handleOpenReference('rec', '4.0')}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Week Selector */}
        <div
          className={`grid grid-cols-1 md:grid-cols-${Math.min(
            stage.weeks.length,
            4
          )} gap-4 mb-8`}
        >
          {stage.weeks.map((week) => {
            const weekDone = week.activities.filter(
              (a) => a.status === 'done'
            ).length;
            return (
              <button
                key={week.id}
                onClick={() => setSelectedWeek(week.number)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedWeek === week.number
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  Week {week.number}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {weekDone}/{week.activities.length}
                </p>
                <p className="text-xs text-slate-600 mt-1">{week.theme}</p>
              </button>
            );
          })}
        </div>

        {selectedWeekData && (
          <>
            {/* Week Banner */}
            <div className="bg-slate-100 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                WEEK {selectedWeekData.number} — {selectedWeekData.theme}
              </h2>
              <p className="text-slate-700">{selectedWeekData.focus}</p>
              {selectedWeekData.dailyNonNegotiables &&
                selectedWeekData.dailyNonNegotiables.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
                    <p className="font-semibold mb-2">
                      Daily non-negotiables:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedWeekData.dailyNonNegotiables.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Day-by-Day Expandable View */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Day-by-Day Tasks
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-3xl">
                Click a day to expand it. Each task card has an expandable
                detail panel with Steps, Success Criteria, and Common Mistakes.
                Tick the checkbox to mark it done. Reference chips open the
                full SOP, Finding, or Recommendation.
              </p>

              <div className="space-y-4">
                {sortedDays.map((day) => {
                  const dayActivities = activitiesByDay[day];
                  const dayDone = dayActivities.filter(
                    (a) => a.status === 'done'
                  ).length;
                  const isExpanded = expandedDays.has(day);

                  return (
                    <div
                      key={day}
                      className="border border-slate-200 rounded-lg"
                    >
                      <button
                        onClick={() => toggleDay(day)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-900">
                            {day}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {dayDone}/{dayActivities.length} tasks
                          </p>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">
                              Tasks for {day}
                            </h5>
                            <div className="space-y-4">
                              {dayActivities.map((activity) => (
                                <ActivityDetailCard
                                  key={activity.id}
                                  activity={activity}
                                  isSelected={activity.status === 'done'}
                                  onToggle={handleUpdateActivityStatus}
                                  onOpenReference={handleOpenReference}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Context — guiding principles, roles, risks, findings */}
            {stage.guidingPrinciples &&
              stage.guidingPrinciples.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Guiding Principles
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm max-w-4xl">
                    {stage.guidingPrinciples.map((p, i) => (
                      <li key={i} className="ml-2">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {stage.roles && stage.roles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Roles & Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.roles.map((r, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900">
                          {r.role}
                          {r.person && r.person !== r.role && (
                            <span className="ml-2 text-sm text-slate-600 font-normal">
                              · {r.person}
                            </span>
                          )}
                        </p>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                          {r.responsibilities.map((resp, j) => (
                            <li key={j}>{resp}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {stage.risks && stage.risks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Risks & Mitigations
                </h3>
                <div className="space-y-3">
                  {stage.risks.map((r, i) => (
                    <Card key={i} className="border-amber-200">
                      <CardContent className="p-4">
                        <p className="font-medium text-slate-900">{r.risk}</p>
                        <p className="text-sm text-slate-700 mt-2">
                          <span className="font-semibold">Mitigation:</span>{' '}
                          {r.mitigation}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Owner: {r.owner}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {stage.auditFindings && stage.auditFindings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Audit Findings Addressed
                </h3>
                <div className="space-y-3">
                  {stage.auditFindings.map((f, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900">
                          {f.finding}
                        </p>
                        <p className="text-sm text-slate-700 mt-2">
                          {f.connection}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 italic">
                          {f.stageRelevance}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reference Drawer */}
      <ReferenceDrawer
        isOpen={referenceDrawerOpen}
        onClose={() => setReferenceDrawerOpen(false)}
        type={referenceType}
        id={referenceId}
      />
    </div>
  );
};

export default Stage1GuidedFlow;
