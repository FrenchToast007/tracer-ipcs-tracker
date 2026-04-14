// @ts-nocheck
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function ExecutiveView() {
  const currentUser = useAppStore((state) => state.currentUser);
  const stages = useAppStore((state) => state.stages);
  const getStageCompletionPercent = useAppStore(
    (state) => state.getStageCompletionPercent
  );
  const getOverallProgress = useAppStore((state) => state.getOverallProgress);

  // Check if user has permission to view this page
  if (!currentUser || !['ceo', 'cfo'].includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="p-4 bg-amber-100 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>
        <p className="text-slate-600 text-center">
          You don't have permission to view the Executive Overview.
        </p>
      </div>
    );
  }

  // Filter non-stage0 stages for the executive view
  const stageMetrics = stages.filter((s) => s.id !== 'stage0').map((stage) => ({
    name: `Stage ${stage.number}`,
    fullName: stage.title,
    completion: getStageCompletionPercent(stage.id),
  }));

  // Calculate activities by status
  const activityStats = {
    pending: 0,
    in_progress: 0,
    done: 0,
    blocked: 0,
  };

  stages.forEach((stage) => {
    stage.weeks.forEach((week) => {
      week.activities.forEach((activity) => {
        activityStats[activity.status as keyof typeof activityStats]++;
      });
    });
  });

  const activityChartData = [
    { name: 'Pending', value: activityStats.pending },
    { name: 'In Progress', value: activityStats.in_progress },
    { name: 'Done', value: activityStats.done },
    { name: 'Blocked', value: activityStats.blocked },
  ];

  // KPI Summary data
  const kpiSummaryData = stages
    .filter((s) => s.id !== 'stage0')
    .map((stage) => ({
      stageId: stage.id,
      stageName: stage.title,
      completion: getStageCompletionPercent(stage.id),
      kpis: stage.kpis.map((kpi) => ({
        id: kpi.id,
        name: kpi.name,
        unit: kpi.unit,
        baseline: kpi.baseline,
        target: kpi.target,
        latest:
          kpi.weeklyValues.week4 ??
          kpi.weeklyValues.week3 ??
          kpi.weeklyValues.week2 ??
          kpi.weeklyValues.week1,
      })),
    }));

  // Stage Overview data
  const stageOverviewData = stages
    .filter((s) => s.id !== 'stage0')
    .map((stage) => {
      const totalActivities = stage.weeks.reduce(
        (total, week) => total + week.activities.length,
        0
      );
      const doneActivities = stage.weeks.reduce(
        (total, week) =>
          total + week.activities.filter((a) => a.status === 'done').length,
        0
      );

      return {
        stageId: stage.id,
        number: stage.number,
        title: stage.title,
        status: stage.status,
        completion: getStageCompletionPercent(stage.id),
        weeksCompleted: stage.weeks.filter((w) => w.status === 'complete')
          .length,
        totalWeeks: stage.weeks.length,
        activitiesDone: doneActivities,
        activitiesTotal: totalActivities,
      };
    });

  // Overall programme health
  const overallCompletion = getOverallProgress();
  const getHealthStatus = (completion: number) => {
    if (completion >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (completion >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (completion >= 40) return { label: 'Fair', color: 'text-amber-600' };
    return { label: 'At Risk', color: 'text-red-600' };
  };

  const healthStatus = getHealthStatus(overallCompletion);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Executive Overview
          </h1>
          <p className="text-slate-600 mt-1">
            Programme performance metrics and health dashboard
          </p>
        </div>

        {/* Overall Health Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Overall Programme Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Overall Completion
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {overallCompletion}%
                </div>
                <Progress value={overallCompletion} className="mt-3 h-2" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Health Status
                </p>
                <div className={`text-3xl font-bold ${healthStatus.color}`}>
                  {healthStatus.label}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Active Stages
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {stages.filter((s) => s.status === 'active').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart - Stage Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Stage Completion Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={stageMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Completion %"
                    dataKey="completion"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart - Activities by Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Activities by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stage Overview Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Stage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Stage
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Completion
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Weeks
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Activities
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stageOverviewData.map((stage) => (
                    <tr
                      key={stage.stageId}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        Stage {stage.number}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {stage.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            stage.status === 'complete' ? 'default' : 'secondary'
                          }
                        >
                          {stage.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={stage.completion}
                              className="h-2 w-24"
                            />
                            <span className="text-xs font-medium text-slate-900">
                              {stage.completion}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {stage.weeksCompleted}/{stage.totalWeeks}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {stage.activitiesDone}/{stage.activitiesTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>KPI Summary by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {kpiSummaryData.map((stageData) => (
                <div key={stageData.stageId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">
                      {stageData.stageName}
                    </h4>
                    <Badge variant="outline">
                      {stageData.completion}% Complete
                    </Badge>
                  </div>

                  {stageData.kpis.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                              KPI
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                              Baseline
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                              Target
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                              Latest
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-slate-600">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stageData.kpis.map((kpi) => {
                            const onTrack =
                              kpi.latest !== undefined &&
                              (kpi.higherIsBetter
                                ? kpi.latest >= kpi.baseline
                                : kpi.latest <= kpi.baseline);

                            return (
                              <tr
                                key={kpi.id}
                                className="border-b border-slate-100"
                              >
                                <td className="py-2 px-3 text-slate-900">
                                  {kpi.name}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {kpi.baseline} {kpi.unit}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {kpi.target} {kpi.unit}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {kpi.latest !== undefined
                                    ? `${kpi.latest} ${kpi.unit}`
                                    : '-'}
                                </td>
                                <td className="py-2 px-3">
                                  {kpi.latest !== undefined && (
                                    <Badge
                                      variant={
                                        onTrack ? 'default' : 'secondary'
                                      }
                                      className={
                                        onTrack
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-slate-100 text-slate-800'
                                      }
                                    >
                                      {onTrack ? 'On Track' : 'Monitor'}
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No KPIs defined</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ExecutiveView;
