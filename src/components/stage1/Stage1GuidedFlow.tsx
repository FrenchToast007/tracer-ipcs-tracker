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
import { HuddleLog } from '@/components/stage0/HuddleLog';
import type { Activity } from '@/data/types';

import { GovernanceArtifactsTracker } from './tools/GovernanceArtifactsTracker';
import { RaciMatrix } from './tools/RaciMatrix';
import { PriorityEscalationLog } from './tools/PriorityEscalationLog';
import { CeoInterventionLog } from './tools/CeoInterventionLog';
import { ComplianceTracker } from './tools/ComplianceTracker';
import { TrainingVerification } from './tools/TrainingVerification';
import { FindAJobDrill } from './tools/FindAJobDrill';

interface Stage1GuidedFlowProps {
  stageId: string;
}

type ToolKey =
  | 'artifacts'
  | 'raci'
  | 'priority'
  | 'ceo'
  | 'compliance'
  | 'training'
  | 'findajob'
  | 'huddle';

const TOOL_LABEL: Record<ToolKey, { title: string; hint: string }> = {
  artifacts: {
    title: 'Governance Artifacts Tracker',
    hint: 'Every document Stage 1 creates lives here. Flip each to Draft → In Review → Signed/Posted as you go.',
  },
  raci: {
    title: 'RACI Matrix',
    hint: 'Exactly one Accountable per decision. Fill with R / A / C / I.',
  },
  priority: {
    title: 'Priority & Escalation Log',
    hint: 'Log every priority change, escalation, stop-the-line, and urgent request.',
  },
  ceo: {
    title: 'CEO Intervention Log',
    hint: 'Capture every CEO override with rationale, downstream impact, and follow-up.',
  },
  compliance: {
    title: 'Job Record Compliance Tracker',
    hint: 'One row per active project. 100% is the bar for Exit #1.',
  },
  training: {
    title: 'Training Verification',
    hint: 'Each lead demonstrates on a live job. Consultant signs each individually.',
  },
  findajob: {
    title: 'Find-a-Job Drill',
    hint: '8 participants, target under 60 seconds each.',
  },
  huddle: {
    title: 'Daily Huddle Log',
    hint: 'Log today\'s huddle — plan, blockers, escalations. 10-minute cap.',
  },
};

const TOOL_ORDER: ToolKey[] = [
  'artifacts', 'raci', 'priority', 'ceo', 'huddle', 'compliance', 'training', 'findajob',
];

// Keyword patterns that indicate a day's activities need a given tool inline.
// Kept generous — better to over-link than under-link.
const TOOL_KEYWORDS: Record<ToolKey, RegExp> = {
  artifacts:
    /charter|raci|priority tier|escalation ladder|naming convention|mandatory field|folder structure|glossary|exception path|template|packet cover|change request|nonconformance|\bncr\b|pack list|huddle board|intervention log format|governance bundle|publish v1|sign.?off/i,
  raci: /\braci\b/i,
  priority:
    /priority tier|priority change|escalation|stop.?the.?line|urgent (request|path|work)|decision tree|frozen window|mock escalation/i,
  ceo: /ceo intervention|ceo override|ceo.?driven|ceo.?dispatch|ceo reprioritiz|ceo.?walkthrough|tally ceo/i,
  compliance:
    /compliance|migrat(e|ion).*(project|basecamp)|naming convention applied|mandatory fields populated|audit.*project|audit.*compliance|100%.*naming/i,
  training:
    /hands.?on (walkthrough|training)|train\b|trained|trainer|walkthrough training|verified|demonstrate|demo.*(locate|update|escalat)|lead.*demonstrat/i,
  findajob: /find.?a.?job|timed.*(find|locate|retriev)|60.?second|under one minute|plan retrieval/i,
  huddle: /daily.*huddle|10.?minute.*(huddle|standup)|production board.*huddle|huddle.*board|huddle.*cadence|install.*huddle/i,
};

export const Stage1GuidedFlow: React.FC<Stage1GuidedFlowProps> = ({
  stageId,
}) => {
  const [, navigate] = useLocation();
  const stages = useAppStore((state) => state.stages);
  const currentUser = useAppStore((state) => state.currentUser);
  const updateActivityStatus = useAppStore((s) => s.updateActivityStatus);
  const addHuddleLog = useAppStore((s) => s.addHuddleLog);
  const deleteHuddleLog = useAppStore((s) => s.deleteHuddleLog);

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'daily' | 'tools'>('daily');
  const [referenceDrawerOpen, setReferenceDrawerOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<'sop' | 'finding' | 'rec' | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const stage = stages.find((s) => s.id === stageId);
  if (!stage) {
    return <div className="p-8 text-center text-slate-600">Stage not found</div>;
  }

  const canEdit = currentUser && !['ceo', 'cfo'].includes(currentUser.role);

  // Progress counters
  const totalActivities = stage.weeks.reduce((sum, w) => sum + w.activities.length, 0);
  const completedActivities = stage.weeks.reduce(
    (sum, w) => sum + w.activities.filter((a) => a.status === 'done').length,
    0
  );
  const completionPercent = totalActivities
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  const selectedWeekData = stage.weeks.find((w) => w.number === selectedWeek);

  // Group by day
  const activitiesByDay = selectedWeekData
    ? selectedWeekData.activities.reduce(
        (acc, a) => {
          (acc[a.day] ??= []).push(a);
          return acc;
        },
        {} as Record<string, typeof selectedWeekData.activities>
      )
    : {};

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIndex = (label: string): number => {
    const first = label.split(/[-/–—]/)[0].trim();
    const i = dayOrder.indexOf(first);
    return i === -1 ? dayOrder.length : i;
  };
  const sortedDays = Object.keys(activitiesByDay).sort((a, b) => dayIndex(a) - dayIndex(b));

  // Figure out which tools a given activity references
  const activityText = (a: Activity) =>
    [
      a.description,
      (a.detailSteps || []).join(' '),
      a.successLooksLike || '',
      a.deliverable || '',
      (a.commonMistakes || []).join(' '),
      a.notes || '',
    ].join(' ');

  const getToolJumpsForActivity = (activity: Activity, day: string) => {
    const haystack = activityText(activity);
    const jumps: { key: string; label: string; targetId: string }[] = [];
    (Object.keys(TOOL_KEYWORDS) as ToolKey[]).forEach((tool) => {
      if (TOOL_KEYWORDS[tool].test(haystack)) {
        jumps.push({
          key: tool,
          label: `Open ${TOOL_LABEL[tool].title}`,
          targetId: `s1-tool-inline-${day}-${tool}`,
        });
      }
    });
    return jumps;
  };

  const getToolsForDay = (day: string): ToolKey[] => {
    const matched = new Set<ToolKey>();
    (activitiesByDay[day] || []).forEach((a) => {
      const haystack = activityText(a);
      (Object.keys(TOOL_KEYWORDS) as ToolKey[]).forEach((tool) => {
        if (TOOL_KEYWORDS[tool].test(haystack)) matched.add(tool);
      });
    });
    return TOOL_ORDER.filter((t) => matched.has(t));
  };

  const renderTool = (tool: ToolKey) => {
    switch (tool) {
      case 'artifacts':
        return (
          <GovernanceArtifactsTracker
            stageId={stageId}
            artifacts={stage.governanceArtifacts || []}
            canEdit={!!canEdit}
          />
        );
      case 'raci':
        return (
          <RaciMatrix
            stageId={stageId}
            rows={stage.raciRows || []}
            columns={stage.raciColumns || []}
            canEdit={!!canEdit}
          />
        );
      case 'priority':
        return (
          <PriorityEscalationLog
            stageId={stageId}
            entries={stage.priorityLog || []}
            canEdit={!!canEdit}
          />
        );
      case 'ceo':
        return (
          <CeoInterventionLog
            stageId={stageId}
            entries={stage.ceoInterventionLog || []}
            canEdit={!!canEdit}
          />
        );
      case 'compliance':
        return (
          <ComplianceTracker
            stageId={stageId}
            rows={stage.complianceRows || []}
            canEdit={!!canEdit}
          />
        );
      case 'training':
        return (
          <TrainingVerification
            stageId={stageId}
            rows={stage.trainingRows || []}
            canEdit={!!canEdit}
          />
        );
      case 'findajob':
        return (
          <FindAJobDrill
            stageId={stageId}
            entries={stage.findAJobEntries || []}
            canEdit={!!canEdit}
          />
        );
      case 'huddle':
        return (
          <HuddleLog
            logs={stage.huddleLogs || []}
            canEdit={!!canEdit}
            currentUserName={currentUser?.name || 'User'}
            onAdd={(entry) => addHuddleLog(stageId, entry)}
            onDelete={(entryId) => deleteHuddleLog(stageId, entryId)}
          />
        );
    }
  };

  const toggleDay = (day: string) => {
    const next = new Set(expandedDays);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    setExpandedDays(next);
  };

  const handleOpenReference = (type: 'sop' | 'finding' | 'rec', id: string) => {
    setReferenceType(type);
    setReferenceId(id);
    setReferenceDrawerOpen(true);
  };

  const handleUpdateActivityStatus = (activityId: string, status: string) => {
    if (!selectedWeekData) return;
    updateActivityStatus(stageId, selectedWeekData.id, activityId, status as any);
  };

  const weekColsClass =
    stage.weeks.length >= 4
      ? 'md:grid-cols-4'
      : stage.weeks.length === 3
      ? 'md:grid-cols-3'
      : stage.weeks.length === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-1';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900">{stage.title}</h1>
          {stage.subtitle && <p className="text-slate-600 mt-2">{stage.subtitle}</p>}
          {stage.description && (
            <p className="text-slate-700 mt-4 max-w-4xl">{stage.description}</p>
          )}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{completionPercent}%</p>
              <p className="text-sm text-slate-600">Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {completedActivities}/{totalActivities}
              </p>
              <p className="text-sm text-slate-600">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stage.weeks.length}</p>
              <p className="text-sm text-slate-600">Weeks</p>
            </div>
          </div>
        </div>

        {/* Audit References panel */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-base text-purple-900">Audit References</CardTitle>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4">
                  Key audit references that guide Stage 1 work. Click any item to view full content.
                </p>
                <div className="flex flex-wrap gap-2">
                  <CrossRefChip type="sop" id="SOP-23" label="SOP-23: Priority Rules & Dispatch" onClick={() => handleOpenReference('sop', 'SOP-23')} />
                  <CrossRefChip type="sop" id="SOP-24" label="SOP-24: Escalation Ladder & Stop-the-Line" onClick={() => handleOpenReference('sop', 'SOP-24')} />
                  <CrossRefChip type="sop" id="SOP-38" label="SOP-38: Integrated Production Control System" onClick={() => handleOpenReference('sop', 'SOP-38')} />
                  <CrossRefChip type="finding" id="E" label="Finding E: Decision rights unclear" onClick={() => handleOpenReference('finding', 'E')} />
                  <CrossRefChip type="finding" id="D" label="Finding D: Handoffs not controlled" onClick={() => handleOpenReference('finding', 'D')} />
                  <CrossRefChip type="rec" id="4.5" label="Rec 4.5: Escalation ladder" onClick={() => handleOpenReference('rec', '4.5')} />
                  <CrossRefChip type="rec" id="4.0" label="Rec 4.0: Guiding Principles" onClick={() => handleOpenReference('rec', '4.0')} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tab switcher */}
        <div className="mb-6 border-b-2 border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 font-semibold text-sm rounded-t-lg border-2 border-b-0 transition-colors ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Day-by-Day (Integrated)
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-3 font-semibold text-sm rounded-t-lg border-2 border-b-0 transition-colors ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Tools (Standalone)
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 mb-1">
            {activeTab === 'daily'
              ? 'Everything you need for each day is in one place — tasks + the tools to log them as you go.'
              : 'All the Stage 1 tools on their own pages — use this view when you want the big picture across weeks.'}
          </p>
        </div>

        {/* Week selector (only on daily tab) */}
        {activeTab === 'daily' && (
          <div className={`grid grid-cols-1 ${weekColsClass} gap-4 mb-8`}>
            {stage.weeks.map((week) => {
              const weekDone = week.activities.filter((a) => a.status === 'done').length;
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
                  <p className="text-sm font-semibold text-slate-900">Week {week.number}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {weekDone}/{week.activities.length}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{week.theme}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ========== DAILY TAB ========== */}
        {activeTab === 'daily' && selectedWeekData && (
          <>
            <div className="bg-slate-100 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                WEEK {selectedWeekData.number} — {selectedWeekData.theme}
              </h2>
              <p className="text-slate-700">{selectedWeekData.focus}</p>
              {selectedWeekData.dailyNonNegotiables && selectedWeekData.dailyNonNegotiables.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
                  <p className="font-semibold mb-2">Daily non-negotiables:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedWeekData.dailyNonNegotiables.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Day-by-Day Tasks</h3>
              <p className="text-sm text-slate-600 mb-6 max-w-3xl">
                Click a day to expand it. Each task card expands further for Steps, Success
                Criteria, and Common Mistakes. The tools you need that day (artifact tracker,
                RACI, priority log, CEO log, etc.) appear right below the tasks.
              </p>

              <div className="space-y-4">
                {sortedDays.map((day) => {
                  const dayActivities = activitiesByDay[day];
                  const dayDone = dayActivities.filter((a) => a.status === 'done').length;
                  const isExpanded = expandedDays.has(day);
                  const dayTools = getToolsForDay(day);

                  return (
                    <div key={day} className="border border-slate-200 rounded-lg">
                      <button
                        onClick={() => toggleDay(day)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-900">{day}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {dayDone}/{dayActivities.length} tasks
                            {dayTools.length > 0 && (
                              <span className="ml-3 text-blue-700">
                                · {dayTools.length} tool{dayTools.length === 1 ? '' : 's'} to use
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-slate-400">{isExpanded ? '▼' : '▶'}</div>
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
                                  toolJumps={getToolJumpsForActivity(activity, day)}
                                />
                              ))}
                            </div>
                          </div>

                          {dayTools.length > 0 && (
                            <div className="pt-4 border-t-2 border-blue-200">
                              <h5 className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-3">
                                Use these tools today
                              </h5>
                              <div className="space-y-6">
                                {dayTools.map((tool) => (
                                  <div
                                    key={`${day}-${tool}`}
                                    id={`s1-tool-inline-${day}-${tool}`}
                                    className="bg-white rounded-lg border-2 border-blue-100 p-4 scroll-mt-6 transition-shadow"
                                  >
                                    <div className="mb-3 pb-2 border-b border-slate-100">
                                      <p className="text-sm font-bold text-slate-900">
                                        {TOOL_LABEL[tool].title}
                                      </p>
                                      <p className="text-xs text-slate-600 mt-0.5">
                                        {TOOL_LABEL[tool].hint}
                                      </p>
                                    </div>
                                    {renderTool(tool)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ========== TOOLS TAB — standalone ========== */}
        {activeTab === 'tools' && (
          <div className="space-y-8 mb-12">
            {TOOL_ORDER.map((tool) => (
              <div key={tool} id={`s1-tool-standalone-${tool}`} className="scroll-mt-6">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{TOOL_LABEL[tool].title}</h3>
                  <p className="text-sm text-slate-600">{TOOL_LABEL[tool].hint}</p>
                </div>
                {renderTool(tool)}
              </div>
            ))}
          </div>
        )}

        {/* Stage context — principles, roles, risks, findings */}
        {activeTab === 'daily' && (
          <>
            {stage.guidingPrinciples && stage.guidingPrinciples.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Guiding Principles</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm max-w-4xl">
                  {stage.guidingPrinciples.map((p, i) => (
                    <li key={i} className="ml-2">{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {stage.roles && stage.roles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Roles & Responsibilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.roles.map((r, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900">
                          {r.role}
                          {r.person && r.person !== r.role && (
                            <span className="ml-2 text-sm text-slate-600 font-normal">· {r.person}</span>
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
                <h3 className="text-xl font-bold text-slate-900 mb-3">Risks & Mitigations</h3>
                <div className="space-y-3">
                  {stage.risks.map((r, i) => (
                    <Card key={i} className="border-amber-200">
                      <CardContent className="p-4">
                        <p className="font-medium text-slate-900">{r.risk}</p>
                        <p className="text-sm text-slate-700 mt-2">
                          <span className="font-semibold">Mitigation:</span> {r.mitigation}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Owner: {r.owner}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {stage.auditFindings && stage.auditFindings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Audit Findings Addressed</h3>
                <div className="space-y-3">
                  {stage.auditFindings.map((f, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-slate-900">{f.finding}</p>
                        <p className="text-sm text-slate-700 mt-2">{f.connection}</p>
                        <p className="text-xs text-slate-500 mt-1 italic">{f.stageRelevance}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
