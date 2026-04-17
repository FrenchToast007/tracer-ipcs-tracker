import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn, scrollToAnchorWithRetry } from '@/lib/utils';

export interface WorkflowStep {
  number: number;
  title: string;
  anchor: string;
  description: string;
  completed: boolean;
  frequency: string;
}

interface WorkflowGuideProps {
  steps: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
}

export const WORKFLOW_STEPS: Omit<WorkflowStep, 'completed'>[] = [
  {
    number: 1,
    title: 'Assign Zone Team Leads',
    anchor: 'section-zones',
    description:
      'Before anything else, assign one Team Lead to each of the 7 plant zones. They will own scoring, huddles, and cleanup for their area.',
    frequency: 'Do once — Week 1, Monday',
  },
  {
    number: 2,
    title: 'Order Supplies',
    anchor: 'section-supplies',
    description:
      'Place orders for all Stage 0 supplies (labels, bins, tape, markers, red tags). Check "Ordered" when you place the order, then "Acquired" when it arrives.',
    frequency: 'Start Week 1 — must be 100% acquired by Week 2',
  },
  {
    number: 3,
    title: 'Complete Day-by-Day Tasks',
    anchor: 'section-daily-tasks',
    description:
      'Work through each day\'s activities in order. Expand a day, read the steps + success criteria, then check off each task as it\'s done.',
    frequency: 'Every working day for 4 weeks',
  },
  {
    number: 4,
    title: 'Score the 5S Audit Weekly',
    anchor: 'section-fives',
    description:
      'Walk each zone with the Team Lead and score all 5 S\'s (Sort, Set in Order, Shine, Standardise, Sustain) from 0–5. Scores improve week over week.',
    frequency: 'Every Friday — Baseline, Week 2, Week 3, Week 4',
  },
  {
    number: 5,
    title: 'Red-Tag Unneeded Items',
    anchor: 'section-redtag',
    description:
      'Any item in a zone that doesn\'t belong gets a red tag. Then decide: discard, relocate, or store. Goal is to clear everything by end of Week 2.',
    frequency: 'Continuous — heaviest in Week 1 Blitz',
  },
  {
    number: 6,
    title: 'Log Daily Huddles',
    anchor: 'section-huddle',
    description:
      'Run the 6-point script every morning (Safety → Yesterday → Today → Problems → Help → Shoutout) and log it here. Build the streak.',
    frequency: 'Every weekday, 10 minutes',
  },
  {
    number: 7,
    title: 'Log Maintenance Issues',
    anchor: 'section-maintenance',
    description:
      'Anything broken, leaking, or worn out during the 5S blitz gets a Maintenance Tag. Assign priority S/M/L. Resolve before stage sign-off.',
    frequency: 'As discovered — review weekly',
  },
  {
    number: 8,
    title: 'Upload Photo Evidence',
    anchor: 'section-photos',
    description:
      'Take before/during/after photos of each zone. These are required for the Stage 0 sign-off package.',
    frequency: 'Weekly — before, during, after shots',
  },
];

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ steps, onStepClick }) => {
  const completedCount = steps.filter((s) => s.completed).length;
  const nextStep = steps.find((s) => !s.completed);

  const handleClick = (step: WorkflowStep) => {
    if (onStepClick) {
      onStepClick(step);
    }
    // scrollToAnchorWithRetry handles the case where the target section
    // hasn't rendered yet (e.g. right after a tab switch).
    scrollToAnchorWithRetry(step.anchor);
  };

  return (
    <Card className="mb-6 border-2 border-blue-300 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">
            Stage 0 Workflow — Do These In Order
          </CardTitle>
          <div className="text-sm font-semibold text-blue-900 bg-white rounded-full px-3 py-1">
            {completedCount} / {steps.length} complete
          </div>
        </div>
        {nextStep && (
          <p className="text-sm text-blue-800 mt-2">
            <span className="font-semibold">Next up:</span> Step {nextStep.number} — {nextStep.title}{' '}
            <button
              onClick={() => handleClick(nextStep)}
              className="underline text-blue-700 hover:text-blue-900 ml-1"
            >
              (jump to section)
            </button>
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-2">
          {steps.map((step) => (
            <li key={step.number}>
              <button
                onClick={() => handleClick(step)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  'flex items-start gap-3 hover:shadow-md',
                  step.completed
                    ? 'bg-green-50 border-green-300 hover:bg-green-100'
                    : 'bg-white border-slate-200 hover:border-blue-400'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {step.number}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      Step {step.number}: {step.title}
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      {step.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              </button>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
