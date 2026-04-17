import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Download, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ZoneAssignment } from './ZoneAssignment';
import { SuppliesChecklist } from './SuppliesChecklist';
import { PhotoUpload } from './PhotoUpload';
import { MaintenanceTagLog } from './MaintenanceTagLog';
import { HuddleLog } from './HuddleLog';
import { FiveSAuditScoring } from './FiveSAuditScoring';
import { RedTagTracker } from './RedTagTracker';
import { EightWastesPanel } from './EightWastesPanel';
import { ActivityDetailCard } from './ActivityDetailCard';
import type { Activity } from '@/data/types';
import { exportStage0ToExcel } from './exportStage0';
import { CrossRefChip } from './CrossRefChip';
import { ReferenceDrawer } from './ReferenceDrawer';
import { WorkflowGuide, WORKFLOW_STEPS } from './WorkflowGuide';
import { SectionHeader, NextStepLink } from './SectionHeader';

interface Stage0GuidedFlowProps {
  stageId: string;
}

export const Stage0GuidedFlow: React.FC<Stage0GuidedFlowProps> = ({
  stageId,
}) => {
  const [, navigate] = useLocation();
  const stages = useAppStore((state) => state.stages);
  const currentUser = useAppStore((state) => state.currentUser);
  const updateActivityStatus = useAppStore((state) => state.updateActivityStatus);
  const updatePlantZone = useAppStore((s) => s.updatePlantZone);
  const toggleSupplyItem = useAppStore((s) => s.toggleSupplyItem);
  const toggleSupplyOrdered = useAppStore((s) => s.toggleSupplyOrdered);
  const updateSupplyQuantity = useAppStore((s) => s.updateSupplyQuantity);
  const addPhoto = useAppStore((s) => s.addPhoto);
  const removePhoto = useAppStore((s) => s.removePhoto);
  const addMaintenanceTag = useAppStore((s) => s.addMaintenanceTag);
  const updateMaintenanceTag = useAppStore((s) => s.updateMaintenanceTag);
  const addHuddleLog = useAppStore((s) => s.addHuddleLog);
  const deleteHuddleLog = useAppStore((s) => s.deleteHuddleLog);
  const addRedTag = useAppStore((s) => s.addRedTag);
  const disposeRedTag = useAppStore((s) => s.disposeRedTag);
  const scoreFiveSZoneWeek = useAppStore((s) => s.scoreFiveSZoneWeek);

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [referenceDrawerOpen, setReferenceDrawerOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<'sop' | 'finding' | 'rec' | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'tools'>('daily');

  const stage = stages.find((s) => s.id === stageId);

  if (!stage) {
    return (
      <div className="p-8 text-center text-slate-600">
        Stage not found
      </div>
    );
  }

  const canEdit = currentUser && !['ceo', 'cfo'].includes(currentUser.role);

  // Calculate completion percentage
  const totalActivities = stage.weeks.reduce((sum, week) => sum + week.activities.length, 0);
  const completedActivities = stage.weeks.reduce(
    (sum, week) =>
      sum + week.activities.filter((a) => a.status === 'done').length,
    0
  );
  const completionPercent = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  const selectedWeekData = stage.weeks.find((w) => w.number === selectedWeek);

  // Calculate workflow step completion status
  const zonesWithLeads = (stage.plantZones || []).filter((z) => z.teamLead && z.teamLead.trim().length > 0).length;
  const totalZones = (stage.plantZones || []).length;
  const suppliesAcquired = (stage.supplies || []).filter((s) => s.acquired).length;
  const totalSupplies = (stage.supplies || []).length;
  const fiveSScored = (stage.fiveSZones || []).some((z) =>
    Object.values(z.weeklyScores || {}).some((v) => v !== undefined)
  );
  const redTagsLogged = (stage.redTags || []).length > 0;
  const huddlesLogged = (stage.huddleLogs || []).length > 0;
  const maintLogged = (stage.maintenanceTags || []).length > 0;
  const photosUploaded = (stage.photos || []).length > 0;

  const workflowSteps = WORKFLOW_STEPS.map((step) => {
    let completed = false;
    switch (step.number) {
      case 1:
        completed = totalZones > 0 && zonesWithLeads === totalZones;
        break;
      case 2:
        completed = totalSupplies > 0 && suppliesAcquired === totalSupplies;
        break;
      case 3:
        completed = totalActivities > 0 && completedActivities === totalActivities;
        break;
      case 4:
        completed = fiveSScored;
        break;
      case 5:
        completed = redTagsLogged;
        break;
      case 6:
        completed = huddlesLogged;
        break;
      case 7:
        completed = maintLogged;
        break;
      case 8:
        completed = photosUploaded;
        break;
    }
    return { ...step, completed };
  });

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

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
  // Sort by the first day in the label — handles single days ("Monday") and
  // ranges ("Tuesday-Thursday", "Monday-Friday") so a spanning label lands
  // at its starting day rather than at the bottom.
  const dayIndex = (label: string): number => {
    const firstDay = label.split(/[-/–—]/)[0].trim();
    const idx = dayOrder.indexOf(firstDay);
    return idx === -1 ? dayOrder.length : idx;
  };
  const sortedDays = Object.keys(activitiesByDay).sort(
    (a, b) => dayIndex(a) - dayIndex(b)
  );

  const weekInfo = {
    1: { title: 'WEEK 1 — PREPARE + BLITZ', theme: 'Prepare + Blitz' },
    2: { title: 'WEEK 2 — STABILISE ROUTINES', theme: 'Stabilise Routines' },
    3: { title: 'WEEK 3 — REINFORCE + CORRECT', theme: 'Reinforce + Correct' },
    4: { title: 'WEEK 4 — LOCK IN + SIGN OFF', theme: 'Lock In + Sign Off' },
  };

  // Which tools appear inline on which day (week, day) -> list of tool keys.
  // It's OK for a tool to appear on multiple days — user said duplication is fine.
  type ToolKey = 'zones' | 'supplies' | 'huddle' | 'redtag' | 'maintenance' | 'fives' | 'photos';
  const toolsForDay = (week: number, day: string): ToolKey[] => {
    const tools: ToolKey[] = [];
    // Daily huddle on every weekday in every week
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) {
      tools.push('huddle');
    }
    // Zones + Photos (before shots) on Week 1 Monday
    if (week === 1 && day === 'Monday') {
      tools.push('zones', 'photos', 'supplies');
    }
    // Supplies check on Week 2 Monday (must be 100% by Week 2)
    if (week === 2 && day === 'Monday') {
      tools.push('supplies');
    }
    // Red tags: Week 1 Tue-Fri blitz, Week 2 all week
    if (
      (week === 1 && ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) ||
      (week === 2 && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day))
    ) {
      tools.push('redtag');
    }
    // Maintenance tags: whenever red tags or 5S happens
    if (
      (week === 1 && ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) ||
      (week === 2 && ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) ||
      (week >= 3 && ['Wednesday', 'Friday'].includes(day))
    ) {
      tools.push('maintenance');
    }
    // 5S scoring on Friday of every week
    if (day === 'Friday') {
      tools.push('fives');
    }
    // Photos on Friday of every week (progress shots) and Week 4 Friday (after)
    if (day === 'Friday') {
      tools.push('photos');
    }
    return tools;
  };

  const renderInlineTool = (tool: ToolKey) => {
    switch (tool) {
      case 'zones':
        return (
          <ZoneAssignment
            zones={stage.plantZones || []}
            onUpdate={handleUpdateZone}
            canEdit={canEdit}
          />
        );
      case 'supplies':
        return (
          <SuppliesChecklist
            supplies={stage.supplies || []}
            onToggle={handleToggleSupply}
            onToggleOrdered={handleToggleSupplyOrdered}
            onUpdateQuantity={handleUpdateSupplyQty}
            canEdit={canEdit}
          />
        );
      case 'huddle':
        return (
          <HuddleLog
            logs={stage.huddleLogs || []}
            canEdit={canEdit}
            currentUserName={currentUser?.name || 'User'}
            onAdd={handleAddHuddleLog}
            onDelete={(entryId) => deleteHuddleLog(stageId, entryId)}
          />
        );
      case 'redtag':
        return (
          <RedTagTracker
            tags={stage.redTags || []}
            zones={stage.plantZones || []}
            canEdit={canEdit}
            onAdd={handleAddRedTag}
            onDispose={handleDisposeRedTag}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTagLog
            tags={stage.maintenanceTags || []}
            onAdd={handleAddMaintenanceTag}
            onResolve={(tagId) => handleUpdateMaintenanceTag(tagId, { resolved: true })}
            zones={stage.plantZones || []}
            canEdit={canEdit}
          />
        );
      case 'fives':
        return (
          <FiveSAuditScoring
            zones={stage.fiveSZones || []}
            canEdit={canEdit}
            onScoreZone={(zoneId, weekKey, scores) =>
              scoreFiveSZoneWeek(stageId, zoneId, weekKey, scores)
            }
          />
        );
      case 'photos':
        return (
          <PhotoUpload
            photos={stage.photos || []}
            canEdit={canEdit}
            onAdd={handleAddPhoto}
            onRemove={handleRemovePhoto}
          />
        );
    }
  };

  const toolLabels: Record<ToolKey, { title: string; hint: string; jumpLabel: string }> = {
    zones: { title: 'Assign Zone Team Leads', hint: 'One lead per zone — do this first thing.', jumpLabel: 'Open Zone Assignment' },
    supplies: { title: 'Supplies Checklist', hint: 'Check off as you order and as items arrive.', jumpLabel: 'Open Supplies Checklist' },
    huddle: { title: 'Daily Huddle Log', hint: 'Run the 6-point script and log it now.', jumpLabel: 'Open Huddle Log' },
    redtag: { title: 'Red Tag Tracker', hint: 'Tag anything that doesn\'t belong in a zone.', jumpLabel: 'Open Red Tag Tracker' },
    maintenance: { title: 'Maintenance Tag Log', hint: 'Log anything broken, leaking, or unsafe.', jumpLabel: 'Open Maintenance Log' },
    fives: { title: '5S Audit Scoring', hint: 'Walk each zone with the lead and score 0–5.', jumpLabel: 'Open 5S Scoring' },
    photos: { title: 'Photo Evidence', hint: 'Before / during / after shots of each zone.', jumpLabel: 'Open Photo Upload' },
  };

  // Keyword map used to figure out which tools a given task text references.
  // Kept generous on purpose — better to over-link than under-link.
  const TOOL_KEYWORDS: Record<ToolKey, RegExp> = {
    huddle: /huddle|stand.?up|morning meeting|6.point script|daily meeting/i,
    redtag: /red.?tag|red tagged|tag.*(unneeded|unused|junk|scrap|surplus|obsolete)/i,
    fives: /\b5s\b|five.?s|audit.*scor|scor.*zone|baseline.*score|weekly.*scor|sort.*set.*shine|standardi[sz]e|\bsustain\b|assess.*zone/i,
    maintenance: /maintenance|broken|leak|worn|unsafe|damaged|not working|out of service|needs repair|tag.*equipment|tag.*machine/i,
    photos: /\bphoto|picture|snap|before.*after|evidence.*(shot|image)|camera|document.*visual/i,
    supplies: /suppl(y|ies)|order.*(label|bin|tape|marker|tag|rag|gloves|paint|caddy)|procurement|purchase order|po\s+\d|receive.*order|stock/i,
    zones: /team lead|zone lead|assign.*lead|zone owner|ownership.*zone|zone.*captain/i,
  };

  const getToolJumpsForActivity = (activity: Activity, day: string) => {
    const haystack = [
      activity.description || '',
      (activity.detailSteps || []).join(' '),
      activity.successLooksLike || '',
      activity.deliverable || '',
      (activity.commonMistakes || []).join(' '),
      activity.notes || '',
    ]
      .join(' ');

    const matched: { key: string; label: string; targetId: string }[] = [];
    (Object.keys(TOOL_KEYWORDS) as ToolKey[]).forEach((tool) => {
      if (TOOL_KEYWORDS[tool].test(haystack)) {
        matched.push({
          key: tool,
          label: toolLabels[tool].jumpLabel,
          targetId: `tool-inline-${day}-${tool}`,
        });
      }
    });
    return matched;
  };

  // Compute the set of tools that should be rendered inline for a given day —
  // the base day mapping PLUS any tool referenced by any of that day's tasks.
  const getExpandedToolsForDay = (week: number, day: string): ToolKey[] => {
    const base = new Set<ToolKey>(toolsForDay(week, day));
    const weekData = stage.weeks.find((w) => w.number === week);
    const dayActivities = weekData?.activities.filter((a) => a.day === day) || [];
    dayActivities.forEach((a) => {
      const jumps = getToolJumpsForActivity(a, day);
      jumps.forEach((j) => base.add(j.key as ToolKey));
    });
    // Keep a sensible display order
    const order: ToolKey[] = ['huddle', 'zones', 'supplies', 'redtag', 'maintenance', 'fives', 'photos'];
    return order.filter((t) => base.has(t));
  };

  const handleOpenReference = (type: 'sop' | 'finding' | 'rec', id: string) => {
    setReferenceType(type);
    setReferenceId(id);
    setReferenceDrawerOpen(true);
  };


  // Wrapper callbacks for child components
  const handleUpdateActivityStatus = (activityId: string, status: string) => {
    if (selectedWeekData) {
      updateActivityStatus(stageId, selectedWeekData.id, activityId, status as any);
    }
  };

  const handleUpdateZone = (zoneId: string, updates: any) => {
    updatePlantZone(stageId, zoneId, updates);
  };

  const handleToggleSupply = (itemId: string) => {
    toggleSupplyItem(stageId, itemId);
  };

  const handleToggleSupplyOrdered = (itemId: string) => {
    toggleSupplyOrdered(stageId, itemId);
  };

  const handleUpdateSupplyQty = (itemId: string, qty: number) => {
    updateSupplyQuantity(stageId, itemId, qty);
  };

  const handleAddPhoto = (photo: any) => {
    addPhoto(stageId, photo);
  };

  const handleRemovePhoto = (photoId: string) => {
    removePhoto(stageId, photoId);
  };

  const handleAddRedTag = (tag: any) => {
    addRedTag(stageId, tag);
  };

  const handleDisposeRedTag = (tagId: string, disposition: any) => {
    disposeRedTag(stageId, tagId, disposition);
  };

  const handleAddHuddleLog = (entry: any) => {
    addHuddleLog(stageId, entry);
  };

  const handleAddMaintenanceTag = (tag: any) => {
    addMaintenanceTag(stageId, tag);
  };

  const handleUpdateMaintenanceTag = (tagId: string, updates: any) => {
    updateMaintenanceTag(stageId, tagId, updates);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Page Title */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {stage.title}
              </h1>
              <p className="text-slate-600 mt-2">{stage.subtitle}</p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportStage0ToExcel(stage)}
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
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
                  Key audit references that guide Stage 0 work. Click any item to view full content.
                </p>
                <div className="flex flex-wrap gap-2">
                  <CrossRefChip
                    type="sop"
                    id="SOP-01"
                    label="SOP-01: 5S and Visual Management"
                    onClick={() => handleOpenReference('sop', 'SOP-01')}
                  />
                  <CrossRefChip
                    type="sop"
                    id="SOP-02"
                    label="SOP-02: Dedicated Storage & Inventory"
                    onClick={() => handleOpenReference('sop', 'SOP-02')}
                  />
                  <CrossRefChip
                    type="finding"
                    id="F"
                    label="Finding F: No visual layout"
                    onClick={() => handleOpenReference('finding', 'F')}
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

        {/* 8 Wastes Panel */}
        <EightWastesPanel />

        {/* Workflow Guide — tells user what to do and in what order */}
        <WorkflowGuide
          steps={workflowSteps}
          onStepClick={(step) => {
            // Step 3 (Day-by-Day Tasks) lives on the Daily tab; everything else is on the Tools tab
            setActiveTab(step.number === 3 ? 'daily' : 'tools');
          }}
        />

        {/* Tab Switcher — Daily integrated view vs Tools standalone view */}
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
              : 'All the Stage 0 tools on their own pages — use this view when you want to see the big picture across all weeks.'}
          </p>
        </div>

        {/* Week Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((week) => {
            const weekActivities = stage.weeks.find((w) => w.number === week)?.activities || [];
            const weekDone = weekActivities.filter((a) => a.status === 'done').length;
            return (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedWeek === week
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  Week {week}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {weekDone}/{weekActivities.length}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {weekInfo[week as keyof typeof weekInfo].theme}
                </p>
              </button>
            );
          })}
        </div>

        {selectedWeekData && (
          <>
            {/* Week Banner */}
            <div className="bg-slate-100 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {weekInfo[selectedWeek as keyof typeof weekInfo].title}
              </h2>
              <p className="text-slate-700">{selectedWeekData.focus}</p>
              {selectedWeekData.productionImpact && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
                  {selectedWeekData.productionImpact}
                </div>
              )}
            </div>

            {/* ========== DAILY TAB — integrated day-by-day view ========== */}
            {activeTab === 'daily' && (
              <div id="section-daily-tasks" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
                <SectionHeader
                  stepNumber={3}
                  totalSteps={8}
                  title="Day-by-Day Tasks (with Tools Built In)"
                  whatToDo="Pick the current week above, then click a day to expand it. For each activity, read the Steps, Success Criteria, and Common Mistakes — check the box when it's done. The tools you need for that day (huddle log, red tag, 5S score, etc.) are right there underneath the tasks."
                />
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {weekInfo[selectedWeek as keyof typeof weekInfo].title}
                </h3>

                <div className="space-y-4">
                  {sortedDays.map((day) => {
                    const dayActivities = activitiesByDay[day];
                    const dayDone = dayActivities.filter(
                      (a) => a.status === 'done'
                    ).length;
                    const isExpanded = expandedDays.has(day);
                    const dayTools = getExpandedToolsForDay(selectedWeek, day);

                    return (
                      <div key={day} className="border border-slate-200 rounded-lg">
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
                              {dayTools.length > 0 && (
                                <span className="ml-3 text-blue-700">
                                  · {dayTools.length} tool{dayTools.length === 1 ? '' : 's'} to use
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-slate-400">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
                            {/* 1. Tasks for the day */}
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

                            {/* 2. Tools the user needs today */}
                            {dayTools.length > 0 && (
                              <div className="pt-4 border-t-2 border-blue-200">
                                <h5 className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-3">
                                  Use these tools today
                                </h5>
                                <div className="space-y-6">
                                  {dayTools.map((tool) => (
                                    <div
                                      key={`${day}-${tool}`}
                                      id={`tool-inline-${day}-${tool}`}
                                      className="bg-white rounded-lg border-2 border-blue-100 p-4 scroll-mt-6 transition-shadow"
                                    >
                                      <div className="mb-3 pb-2 border-b border-slate-100">
                                        <p className="text-sm font-bold text-slate-900">
                                          {toolLabels[tool].title}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                          {toolLabels[tool].hint}
                                        </p>
                                      </div>
                                      {renderInlineTool(tool)}
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
            )}

            {/* ========== TOOLS TAB — standalone numbered sections ========== */}
            {activeTab === 'tools' && (
              <>
            {/* STEP 1: Zone Team Leads */}
            <div id="section-zones" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={1}
                totalSteps={8}
                title="Assign Zone Team Leads"
                whatToDo="Click a Team Lead box below and type the person's name. Do this for all 7 zones before Monday ends. These are the people who own cleanup and scoring in their area."
              />
              <ZoneAssignment
                zones={stage.plantZones || []}
                onUpdate={handleUpdateZone}
                canEdit={canEdit}
              />
              <NextStepLink nextAnchor="section-supplies" nextLabel="Order Supplies" />
            </div>

            {/* STEP 2: Supplies */}
            <div id="section-supplies" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={2}
                totalSteps={8}
                title="Order Supplies"
                whatToDo="Go down the list. When you place an order for an item, click the Ordered checkbox. When the item physically arrives at the plant, click Acquired. Adjust quantity if you ordered a different amount."
              />
              <SuppliesChecklist
                supplies={stage.supplies || []}
                onToggle={handleToggleSupply}
                onToggleOrdered={handleToggleSupplyOrdered}
                onUpdateQuantity={handleUpdateSupplyQty}
                canEdit={canEdit}
              />
              <NextStepLink nextAnchor="section-fives" nextLabel="Score the 5S Audit" />
            </div>

            {/* STEP 4: 5S Audit Scoring */}
            <div id="section-fives" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={4}
                totalSteps={8}
                title="Score the 5S Audit Weekly"
                whatToDo="Every Friday, walk each zone with the Team Lead. Click a score cell in the table, then rate each S (Sort, Set in Order, Shine, Standardise, Sustain) from 0–5. Add notes if useful. Aim for green (18+) by Week 4."
              />
              <FiveSAuditScoring
                zones={stage.fiveSZones || []}
                canEdit={canEdit}
                onScoreZone={(zoneId, weekKey, scores) => scoreFiveSZoneWeek(stageId, zoneId, weekKey, scores)}
              />
              <NextStepLink nextAnchor="section-redtag" nextLabel="Red-Tag Unneeded Items" />
            </div>

            {/* STEP 5: Red Tag Tracker */}
            <div id="section-redtag" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={5}
                totalSteps={8}
                title="Red-Tag Unneeded Items"
                whatToDo="When you find something in a zone that doesn't belong (broken, expired, unused), fill in the Add Red Tag form. After review, click Discard / Relocate / Store to dispose of it. Goal: clear all red tags by end of Week 2."
              />
              <RedTagTracker
                tags={stage.redTags || []}
                zones={stage.plantZones || []}
                canEdit={canEdit}
                onAdd={handleAddRedTag}
                onDispose={handleDisposeRedTag}
              />
              <NextStepLink nextAnchor="section-huddle" nextLabel="Log Daily Huddles" />
            </div>

            {/* STEP 6: Huddle Log */}
            <div id="section-huddle" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={6}
                totalSteps={8}
                title="Log Daily Huddles"
                whatToDo="Every morning at 7:30am, run the 6-point huddle script with the crew. Fill in all 6 fields and click Submit. You need 20+ consecutive weekdays logged by Stage 0 sign-off."
              />
              <HuddleLog
                logs={stage.huddleLogs || []}
                canEdit={canEdit}
                currentUserName={currentUser?.name || "User"}
                onAdd={handleAddHuddleLog}
                onDelete={(entryId) => deleteHuddleLog(stageId, entryId)}
              />
              <NextStepLink nextAnchor="section-maintenance" nextLabel="Log Maintenance Issues" />
            </div>

            {/* STEP 7: Maintenance Tag Log */}
            <div id="section-maintenance" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={7}
                totalSteps={8}
                title="Log Maintenance Issues"
                whatToDo="Anything broken, leaking, worn, or unsafe that you find during the 5S blitz goes here. Pick a zone, describe the issue, set priority (Small/Medium/Large), and submit. Click Resolve when fixed."
              />
              <MaintenanceTagLog
                tags={stage.maintenanceTags || []}
                onAdd={handleAddMaintenanceTag}
                onResolve={(tagId) => handleUpdateMaintenanceTag(tagId, {resolved: true})}
                zones={stage.plantZones || []}
                canEdit={canEdit}
              />
              <NextStepLink nextAnchor="section-photos" nextLabel="Upload Photo Evidence" />
            </div>

            {/* STEP 8: Photo Upload */}
            <div id="section-photos" className="mb-10 scroll-mt-6 rounded-lg transition-shadow">
              <SectionHeader
                stepNumber={8}
                totalSteps={8}
                title="Upload Photo Evidence"
                whatToDo="Take Before, During, and After shots of each zone. Click Choose File, add a caption, pick the zone, and upload. These photos are REQUIRED for Stage 0 sign-off — no photos, no sign-off."
              />
              <PhotoUpload
                photos={stage.photos || []}
                canEdit={canEdit}
                onAdd={handleAddPhoto}
                onRemove={handleRemovePhoto}
              />
            </div>
              </>
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
// This will be appended to verify file size
