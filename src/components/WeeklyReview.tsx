import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Week, KPI } from '@/data/types';
import { Card } from '@/components/ui/card';

interface WeeklyReviewProps {
  stageId: string;
  week: Week;
  kpis: KPI[];
}

export function WeeklyReview({ stageId, week, kpis }: WeeklyReviewProps) {
  const { submitWeeklyReview } = useAppStore();
  const [kpiValues, setKpiValues] = useState<Record<string, number>>(
    week.reviewData?.kpiValues ?? {}
  );
  const [notes, setNotes] = useState(week.reviewData?.notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      submitWeeklyReview(stageId, week.id, kpiValues, notes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = week.reviewData?.submitted ?? false;

  if (isSubmitted && week.reviewData) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Review Submitted</h3>
            <p className="text-sm text-gray-600">
              Submitted {new Date(week.reviewData.submittedAt!).toLocaleDateString()} by{' '}
              {week.reviewData.submittedBy}
            </p>
          </div>

          <div className="bg-white rounded p-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">KPI Values</h4>
              <div className="space-y-2">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{kpi.name}</span>
                    <span className="font-medium text-gray-900">
                      {week.reviewData?.kpiValues?.[kpi.id] ?? '-'} {kpi.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {week.reviewData.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {week.reviewData.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Week {week.number} Review</h3>
          <p className="text-sm text-gray-600">Theme: {week.theme}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">KPI Values</h4>
            <div className="space-y-3">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 block">
                      {kpi.name}
                      <span className="text-gray-500"> ({kpi.unit})</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={kpiValues[kpi.id] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setKpiValues((prev) => ({
                            ...prev,
                            [kpi.id]: val,
                          }));
                        }}
                        placeholder="Enter value"
                        className="h-9"
                      />
                      <span className="text-xs text-gray-500">Target: {kpi.target}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-notes" className="text-sm text-gray-700 mb-2 block">
              Notes
            </Label>
            <Textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any observations, challenges, or insights from this week..."
              className="min-h-32"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
