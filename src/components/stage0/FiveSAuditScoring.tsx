import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { FiveSZone, FiveSScores } from '@/data/types';
import { cn } from '@/lib/utils';

interface FiveSAuditScoringProps {
  zones: FiveSZone[];
  onScoreZone: (zoneId: string, weekKey: string, scores: FiveSScores) => void;
  canEdit: boolean;
}

const WEEK_KEYS = ['baseline', 'week2', 'week3', 'week4'] as const;
const WEEK_LABELS: Record<(typeof WEEK_KEYS)[number], string> = {
  baseline: 'Baseline',
  week2: 'Week 2',
  week3: 'Week 3',
  week4: 'Week 4',
};

const CRITERIA = [
  { key: 'sort', label: 'Sort', description: 'Remove unnecessary items' },
  { key: 'setInOrder', label: 'Set in Order', description: 'Organize items logically' },
  { key: 'shine', label: 'Shine', description: 'Clean and maintain' },
  { key: 'standardize', label: 'Standardize', description: 'Create standard procedures' },
  { key: 'sustain', label: 'Sustain', description: 'Maintain improvements' },
] as const;

const getScoreColor = (score?: number) => {
  if (score === undefined || score === null) return 'bg-gray-100 text-gray-700';
  if (score <= 10) return 'bg-red-100 text-red-700';
  if (score <= 17) return 'bg-amber-100 text-amber-700';
  return 'bg-green-100 text-green-700';
};

const getTrendIcon = (prev?: number, current?: number) => {
  if (!prev || !current) return null;
  if (current > prev) {
    return <ArrowUp size={16} className="text-green-600" />;
  }
  if (current < prev) {
    return <ArrowDown size={16} className="text-red-600" />;
  }
  return <Minus size={16} className="text-gray-400" />;
};

function ScoringForm({
  zone,
  weekKey,
  currentScores,
  onSubmit,
}: {
  zone: FiveSZone;
  weekKey: string;
  currentScores?: FiveSScores;
  onSubmit: (scores: FiveSScores) => void;
}) {
  const [scores, setScores] = useState<Record<string, number>>({
    sort: currentScores?.sort ?? 0,
    setInOrder: currentScores?.setInOrder ?? 0,
    shine: currentScores?.shine ?? 0,
    standardize: currentScores?.standardize ?? 0,
    sustain: currentScores?.sustain ?? 0,
  });
  const [notes, setNotes] = useState(currentScores?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sort: scores.sort,
      setInOrder: scores.setInOrder,
      shine: scores.shine,
      standardize: scores.standardize,
      sustain: scores.sustain,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {CRITERIA.map((criterion) => (
        <div key={criterion.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {criterion.label}
              </label>
              <p className="text-xs text-gray-600">{criterion.description}</p>
            </div>
            <div className="text-sm font-bold text-gray-900">
              {scores[criterion.key]}/5
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            value={scores[criterion.key]}
            onChange={(e) =>
              setScores({
                ...scores,
                [criterion.key]: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>5</span>
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this assessment"
          className="min-h-16 resize-none"
        />
      </div>

      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 w-full"
      >
        Save Scores
      </Button>
    </form>
  );
}

export function FiveSAuditScoring({
  zones,
  onScoreZone,
  canEdit,
}: FiveSAuditScoringProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const calculateAverage = (scores?: FiveSScores): number | undefined => {
    if (!scores) return undefined;
    const values = [
      scores.sort,
      scores.setInOrder,
      scores.shine,
      scores.standardize,
      scores.sustain,
    ].filter((v) => typeof v === 'number');
    if (values.length === 0) return undefined;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  };

  const calculateZoneAverage = (zone: FiveSZone): number | undefined => {
    const averages = WEEK_KEYS
      .map((week) => calculateAverage(zone.weeklyScores[week]))
      .filter((avg) => avg !== undefined) as number[];

    if (averages.length === 0) return undefined;
    return Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 100) / 100;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">5S Audit Scoring</h3>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Zone</th>
                {WEEK_KEYS.map((week) => (
                  <th key={week} className="px-4 py-3 text-center font-medium text-gray-700">
                    {WEEK_LABELS[week]}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium text-gray-700">Average</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone, idx) => (
                <tr
                  key={zone.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{zone.name}</td>
                  {WEEK_KEYS.map((week, weekIdx) => {
                    const scores = zone.weeklyScores[week];
                    const avg = calculateAverage(scores);
                    const prevWeekScores =
                      weekIdx > 0 ? zone.weeklyScores[WEEK_KEYS[weekIdx - 1]] : undefined;
                    const prevAvg = calculateAverage(prevWeekScores);

                    return (
                      <td
                        key={week}
                        className="px-4 py-3 text-center"
                      >
                        <Dialog
                          open={openDialog === `${zone.id}-${week}`}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDialog(`${zone.id}-${week}`);
                            } else {
                              setOpenDialog(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <button
                              disabled={!canEdit}
                              className={cn(
                                'px-3 py-2 rounded font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity',
                                getScoreColor(avg)
                              )}
                            >
                              {avg !== undefined ? avg : '—'}
                            </button>
                          </DialogTrigger>
                          {canEdit && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Score {zone.name} - {WEEK_LABELS[week]}
                                </DialogTitle>
                              </DialogHeader>
                              <ScoringForm
                                zone={zone}
                                weekKey={week}
                                currentScores={scores}
                                onSubmit={(newScores) => {
                                  onScoreZone(zone.id, week, newScores);
                                  setOpenDialog(null);
                                }}
                              />
                            </DialogContent>
                          )}
                        </Dialog>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center font-semibold">
                    <div className={cn('px-3 py-2 rounded inline-block', getScoreColor(calculateZoneAverage(zone)))}>
                      {calculateZoneAverage(zone) ?? '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 rounded-lg p-3 text-center text-xs">
          <div className="font-semibold text-red-700">0–10</div>
          <div className="text-red-600">Needs Improvement</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center text-xs">
          <div className="font-semibold text-amber-700">11–17</div>
          <div className="text-amber-600">In Progress</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center text-xs">
          <div className="font-semibold text-green-700">18–25</div>
          <div className="text-green-600">Excellent</div>
        </div>
      </div>
    </div>
  );
}
