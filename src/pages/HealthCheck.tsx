import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export function HealthCheck() {
  const currentUser = useAppStore((state) => state.currentUser);
  const stages = useAppStore((state) => state.stages);
  const getStageCompletionPercent = useAppStore(
    (state) => state.getStageCompletionPercent
  );

  // Check if user has permission to view this page
  if (!currentUser || currentUser.role !== 'consultant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="p-4 bg-amber-100 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>
        <p className="text-slate-600 text-center">
          You don't have permission to view the Programme Health Check.
        </p>
      </div>
    );
  }

  // Calculate health classifications for each stage
  const stageHealthData = stages
    .filter((s) => s.id !== 'stage0')
    .map((stage) => {
      const completion = getStageCompletionPercent(stage.id);
      const blockedActivities = stage.weeks.reduce(
        (total, week) =>
          total + week.activities.filter((a) => a.status === 'blocked').length,
        0
      );

      // Classification logic
      let healthStatus: 'green' | 'amber' | 'red';
      let riskLevel: string;

      if (completion >= 70 && blockedActivities === 0) {
        healthStatus = 'green';
        riskLevel = 'Low';
      } else if (
        (completion >= 30 && completion < 70) ||
        blockedActivities > 0
      ) {
        healthStatus = 'amber';
        riskLevel = 'Medium';
      } else {
        healthStatus = 'red';
        riskLevel = 'High';
      }

      return {
        stageId: stage.id,
        number: stage.number,
        title: stage.title,
        completion,
        blockedActivities,
        healthStatus,
        riskLevel,
        stage,
      };
    });

  // Calculate overall health summary
  const greenStages = stageHealthData.filter(
    (s) => s.healthStatus === 'green'
  ).length;
  const amberStages = stageHealthData.filter(
    (s) => s.healthStatus === 'amber'
  ).length;
  const redStages = stageHealthData.filter(
    (s) => s.healthStatus === 'red'
  ).length;

  const totalBlockedActivities = stageHealthData.reduce(
    (total, stage) => total + stage.blockedActivities,
    0
  );

  const overallCompletion = Math.round(
    stageHealthData.reduce((total, stage) => total + stage.completion, 0) /
      stageHealthData.length
  );

  // Get all blocked activities with details
  const allBlockedActivities = stageHealthData
    .flatMap((stageData) => {
      const blockedActivity = stageData.stage.weeks
        .flatMap((week) =>
          week.activities
            .filter((a) => a.status === 'blocked')
            .map((activity) => ({
              stageNumber: stageData.number,
              stageName: stageData.title,
              activityDescription: activity.description,
              owner: activity.owner,
              notes: activity.notes,
            }))
        );
      return blockedActivity;
    });

  // Identify key risks
  const keyRisks = stageHealthData
    .filter((s) => s.healthStatus !== 'green')
    .flatMap((stageData) => {
      const risks = [];
      if (stageData.completion < 30) {
        risks.push(
          `Stage ${stageData.number} at risk: Only ${stageData.completion}% complete`
        );
      }
      if (stageData.blockedActivities > 3) {
        risks.push(
          `Stage ${stageData.number}: ${stageData.blockedActivities} blocked activities`
        );
      }
      return risks;
    });

  const getHealthIcon = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
      case 'green':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'amber':
        return <AlertTriangle className="w-8 h-8 text-amber-600" />;
      case 'red':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getHealthColor = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'amber':
        return 'border-amber-200 bg-amber-50';
      case 'red':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Programme Health Check
          </h1>
          <p className="text-slate-600 mt-1">
            Consultant health assessment and risk monitoring
          </p>
        </div>

        {/* Overall Health Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Overall Programme Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Green Stages */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-slate-600">
                    Green Stages
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {greenStages}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  On track, no blockers
                </p>
              </div>

              {/* Amber Stages */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-medium text-slate-600">
                    Amber Stages
                  </p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {amberStages}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Needs attention
                </p>
              </div>

              {/* Red Stages */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-slate-600">
                    Red Stages
                  </p>
                </div>
                <p className="text-3xl font-bold text-red-600">{redStages}</p>
                <p className="text-xs text-slate-600 mt-1">
                  High risk
                </p>
              </div>

              {/* Total Blocked Activities */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  <p className="text-sm font-medium text-slate-600">
                    Blocked Activities
                  </p>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {totalBlockedActivities}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Requiring immediate action
                </p>
              </div>
            </div>

            {/* Overall Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Average Stage Completion
                </p>
                <span className="text-sm font-bold text-slate-900">
                  {overallCompletion}%
                </span>
              </div>
              <Progress value={overallCompletion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Key Risks Section */}
        {keyRisks.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Key Risks Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {keyRisks.map((risk, idx) => (
                  <li key={idx} className="text-sm text-red-800 flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Stage Health Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Stage Health Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stageHealthData.map((stageData) => (
              <Card
                key={stageData.stageId}
                className={`border-2 ${getHealthColor(stageData.healthStatus)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Stage {stageData.number}
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {stageData.title}
                      </h3>
                    </div>
                    {getHealthIcon(stageData.healthStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Health Status Badge */}
                  <Badge
                    className={
                      stageData.healthStatus === 'green'
                        ? 'bg-green-100 text-green-800'
                        : stageData.healthStatus === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {stageData.healthStatus.toUpperCase()} - {stageData.riskLevel} Risk
                  </Badge>

                  {/* Completion Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">
                        Completion
                      </p>
                      <span className="text-sm font-bold text-slate-900">
                        {stageData.completion}%
                      </span>
                    </div>
                    <Progress value={stageData.completion} className="h-2" />
                  </div>

                  {/* Blocked Activities */}
                  {stageData.blockedActivities > 0 && (
                    <div className="rounded-md bg-white p-3 border border-current">
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        Blocked Activities
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {stageData.blockedActivities}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Blocked Activities Warnings */}
        {allBlockedActivities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Blocked Activity Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allBlockedActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          Stage {activity.stageNumber}: {activity.stageName}
                        </Badge>
                        <p className="font-medium text-slate-900">
                          {activity.activityDescription}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Owner: {activity.owner}
                        </p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    </div>

                    {activity.notes && (
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          Notes:
                        </p>
                        <p className="text-sm text-slate-700">
                          {activity.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {allBlockedActivities.length === 0 && totalBlockedActivities === 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-900">
                No Blocked Activities
              </p>
              <p className="text-slate-600 mt-1">
                All stages are progressing smoothly
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default HealthCheck;
