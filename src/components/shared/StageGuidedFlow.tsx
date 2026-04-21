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
import type { Activity, Stage } from '@/data/types';
import type { StageFlowConfig, InlineTool } from './stageFlowConfigs';

interface Props {
  stageId: string;
  config: StageFlowConfig;
}

const activityText = (a: Activity) =>
  [
    a.description,
    (a.detailSteps || []).join(' '),
    a.successLooksLike || '',
    a.deliverable || '',
    (a.commonMistakes || []).join(' '),
    a.notes || '',
  ].join(' ');

export const StageGuidedFlow: React.FC<Props> = ({ stageId, config }) => {
  const [, navigate] = useLocation();
  const stages = useAppStore((s) => s.stages);
  const currentUser = useAppStore((s) => s.currentUser);
  const updateActivityStatus = useAppStore((s) => s.updateActivityStatus);

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'daily' | 'tools'>('daily');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'sop' | 'finding' | 'rec' | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const stage = stages.find((s) => s.id === stageId);
  if (!stage) return <div className="p-8 text-center text-slate-600">Stage not found</div>;

  const canEdit = currentUser && !['ceo', 'cfo'].includes(currentUser.role);

  // Stage progress
  const total = stage.weeks.reduce((sum, w) => sum + w.activities.length, 0);
  const done = stage.weeks.reduce(
    (sum, w) => sum + w.activities.filter((a) => a.status === 'done').length,
    0
  );
  const pct = total ? Math.round((done / total) * 100) : 0;
  const selectedWeekData = stage.weeks.find((w) => w.number === selectedWeek);

  // Group by day + sort
  const byDay = selectedWeekData
    ? selectedWeekData.activities.reduce(
        (acc, a) => {
          (acc[a.day] ??= []).push(a);
          return acc;
        },
        {} as Record<string, Activity[]>
      )
    : {};
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIdx = (label: string) => {
    const first = label.split(/[-/–—]/)[0].trim();
    const i = dayOrder.indexOf(first);
    return i === -1 ? dayOrder.length : i;
  };
  const sortedDays = Object.keys(byDay).sort((a, b) => dayIdx(a) - dayIdx(b));

  const handleOpenReference = (type: 'sop' | 'finding' | 'rec', id: string) => {
    setDrawerType(type);
    setDrawerId(id);
    setDrawerOpen(true);
  };

  const handleUpdateActivityStatus = (activityId: string, status: string) => {
    if (!selectedWeekData) return;
    updateActivityStatus(stageId, selectedWeekData.id, activityId, status as any);
  };

  const getToolsForDay = (day: string): InlineTool[] => {
    const matched = new Map<string, InlineTool>();
    (byDay[day] || []).forEach((a) => {
      const hay = activityText(a);
      for (const tool of config.inlineTools) {
        if (tool.keywords.test(hay)) matched.set(tool.key, tool);
      }
    });
    return config.inlineTools.filter((t) => matched.has(t.key));
  };

  const getToolJumps = (a: Activity, day: string) => {
    const hay = activityText(a);
    return config.inlineTools
      .filter((t) => t.keywords.test(hay))
      .map((t) => ({
        key: t.key,
        label: `Open ${t.title}`,
        targetId: `sg-tool-${day}-${t.key}`,
      }));
  };

  const toggleDay = (day: string) => {
    const next = new Set(expandedDays);
    next.has(day) ? next.delete(day) : next.add(day);
    setExpandedDays(next);
  };

  const weekColsClass =
    stage.weeks.length >= 4
      ? 'md:grid-cols-4'
      : stage.weeks.length === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-2';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900">{stage.title}</h1>
          {stage.subtitle && <p className="text-slate-600 mt-2">{stage.subtitle}</p>}
          {stage.description && (
            <p className="text-slate-700 mt-4 max-w-4xl">{stage.description}</p>
          )}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{pct}%</p>
              <p className="text-sm text-slate-600">Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{done}/{total}</p>
              <p className="text-sm text-slate-600">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stage.weeks.length}</p>
              <p className="text-sm text-slate-600">Weeks</p>
            </div>
          </div>
        </div>

        {/* Audit References */}
        {config.referenceChips && config.referenceChips.length > 0 && (
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
                    Key audit references for this stage. Click any item to view full content.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.referenceChips.map((c, i) => (
                      <CrossRefChip
                        key={i}
                        type={c.type}
                        id={c.id}
                        label={c.label}
                        onClick={() => handleOpenReference(c.type, c.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

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
              : 'All stage tools on their own pages — use this view when you want the big picture across weeks.'}
          </p>
        </div>

        {/* Daily tab */}
        {activeTab === 'daily' && (
          <>
            <div className={`grid grid-cols-1 ${weekColsClass} gap-4 mb-8`}>
              {stage.weeks.map((week) => {
                const wd = week.activities.filter((a) => a.status === 'done').length;
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
                      {wd}/{week.activities.length}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{week.theme}</p>
                  </button>
                );
              })}
            </div>

            {selectedWeekData && (
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
                    Click a day to expand it. Each task expands further for Steps, Success Criteria,
                    and Common Mistakes. The tools you need that day appear right below the tasks.
                  </p>

                  <div className="space-y-4">
                    {sortedDays.map((day) => {
                      const dayActivities = byDay[day];
                      const dayDone = dayActivities.filter((a) => a.status === 'done').length;
                      const isExpanded = expandedDays.has(day);
                      const tools = getToolsForDay(day);

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
                                {tools.length > 0 && (
                                  <span className="ml-3 text-blue-700">
                                    · {tools.length} tool{tools.length === 1 ? '' : 's'} to use
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
                                  {dayActivities.map((a) => (
                                    <ActivityDetailCard
                                      key={a.id}
                                      activity={a}
                                      isSelected={a.status === 'done'}
                                      onToggle={handleUpdateActivityStatus}
                                      onOpenReference={handleOpenReference}
                                      toolJumps={getToolJumps(a, day)}
                                    />
                                  ))}
                                </div>
                              </div>

                              {tools.length > 0 && (
                                <div className="pt-4 border-t-2 border-blue-200">
                                  <h5 className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-3">
                                    Use these tools today
                                  </h5>
                                  <div className="space-y-6">
                                    {tools.map((tool) => (
                                      <div
                                        key={`${day}-${tool.key}`}
                                        id={`sg-tool-${day}-${tool.key}`}
                                        className="bg-white rounded-lg border-2 border-blue-100 p-4 scroll-mt-6"
                                      >
                                        <div className="mb-3 pb-2 border-b border-slate-100">
                                          <p className="text-sm font-bold text-slate-900">{tool.title}</p>
                                          <p className="text-xs text-slate-600 mt-0.5">{tool.hint}</p>
                                        </div>
                                        {tool.render(stage, !!canEdit, currentUser)}
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
          </>
        )}

        {/* Tools tab */}
        {activeTab === 'tools' && (
          <div className="space-y-8 mb-12">
            {config.inlineTools.map((t) => (
              <div key={t.key} className="scroll-mt-6">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                  <p className="text-sm text-slate-600">{t.hint}</p>
                </div>
                {t.render(stage, !!canEdit, currentUser)}
              </div>
            ))}
          </div>
        )}

        {/* Context blocks */}
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
                <h3 className="text-xl font-bold text-slate-900 mb-3">Roles &amp; Responsibilities</h3>
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
                <h3 className="text-xl font-bold text-slate-900 mb-3">Risks &amp; Mitigations</h3>
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
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        type={drawerType}
        id={drawerId}
      />
    </div>
  );
};

export default StageGuidedFlow;
