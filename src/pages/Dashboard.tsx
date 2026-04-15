import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';
import { useLocation } from 'wouter';

export function Dashboard() {
  const currentUser = useAppStore((state) => state.currentUser);
  const stages = useAppStore((state) => state.stages);
  const [, navigate] = useLocation();

  // Get stage 0 and all other stages
  const stage0 = stages.find((s) => s.id === 'stage0');
  const otherStages = stages.filter((s) => s.id !== 'stage0');

  // Calculate activities completed across all stages
  const activitiesCompleted = stages.reduce((total, stage) => {
    return (
      total +
      stage.weeks.reduce((weekTotal, week) => {
        return (
          weekTotal +
          week.activities.filter((a) => a.status === 'done').length
        );
      }, 0)
    );
  }, 0);

  // Calculate total activities
  const totalActivities = stages.reduce((total, stage) => {
    return (
      total +
      stage.weeks.reduce((weekTotal, week) => {
        return weekTotal + week.activities.length;
      }, 0)
    );
  }, 0);

  // Calculate stages complete
  const stagesComplete = stages.filter((s) => s.status === 'complete').length;

  // Calculate stages in progress
  const stagesInProgress = stages.filter((s) => s.status === 'active').length;

  // Get overall progress
  const overallProgress = Math.round(
    stages.reduce((sum, stage) => sum + stage.completionPercent, 0) /
      stages.length
  );

  const getStatusBadge = (status: string) => {
    if (status === 'locked') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lock size={14} /> LOCKED
        </Badge>
      );
    }
    if (status === 'active') {
      return <Badge className="bg-slate-400">NOT STARTED</Badge>;
    }
    if (status === 'complete') {
      return <Badge className="bg-green-600">COMPLETE</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const handleStageClick = (stageId: string) => {
    if (stageId === 'stage0') {
      navigate(`/stage/${stageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">IPCS Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Hello World, {currentUser?.name} · Last updated Apr 7, 11:30 AM
          </p>
        </div>

        {/* Top Right Badge */}
        <div className="flex justify-end mb-6">
          <Badge variant="outline">Overall: {overallProgress}% complete</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stages Complete */}
          <Card>
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {stagesComplete}/8
              </p>
              <p className="text-sm text-slate-600">Stages Complete</p>
            </CardContent>
          </Card>

          {/* Stages In Progress */}
          <Card>
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {stagesInProgress}
              </p>
              <p className="text-sm text-slate-600">Stages In Progress</p>
            </CardContent>
          </Card>

          {/* Activities Completed */}
          <Card>
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {activitiesCompleted}
              </p>
              <p className="text-sm text-slate-600">
                Activities Completed
                <br />
                of {totalActivities} total
              </p>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {overallProgress}%
              </p>
              <p className="text-sm text-slate-600">Overall Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Stages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Implementation Stages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage.id)}
                disabled={stage.status === 'locked'}
                className={`text-left transition-all ${
                  stage.status === 'locked'
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:shadow-md'
                }`}
              >
                <Card className={stage.status !== 'locked' ? 'hover:border-slate-300' : ''}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Stage Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                          {stage.number}
                        </div>
                      </div>

                      {/* Stage Content */}
                      <div className="flex-1">
                        {/* Status Badge */}
                        <div className="mb-2">
                          {getStatusBadge(stage.status)}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {stage.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-sm text-slate-600 mb-4">
                          {stage.subtitle}
                        </p>

                        {/* Activity Count and Progress */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-600">
                            {stage.weeks.reduce(
                              (sum, week) => sum + week.activities.length,
                              0
                            )}{' '}
                            activities
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {stage.completionPercent}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <Progress
                          value={stage.completionPercent}
                          className="h-2 mb-3"
                        />

                        {/* Week Pills for Stage 0 */}
                        {stage.id === 'stage0' && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            <Badge variant="outline" className="bg-slate-50">
                              W1
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50">
                              W2
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50">
                              W3
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50">
                              W4
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            Quick Actions
          </h3>
          <p className="text-slate-600">
            No stages currently in progress. Start with Stage 0.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
