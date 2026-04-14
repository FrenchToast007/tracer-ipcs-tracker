// @ts-nocheck
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { FiveSScores } from '@/data/types';
import { cn } from '@/lib/utils';

interface FiveScoringProps {
  stageId: string;
}

const FIVE_S_CRITERIA = [
  { key: 'sort', label: 'Sort', description: 'Eliminate unnecessary items' },
  { key: 'setInOrder', label: 'Set in Order', description: 'Arrange items logically' },
  { key: 'shine', label: 'Shine', description: 'Clean and maintain area' },
  { key: 'standardize', label: 'Standardize', description: 'Create standards' },
  { key: 'sustain', label: 'Sustain', description: 'Maintain discipline' },
];

const WEEKS = [
  { key: 'baseline', label: 'Baseline' },
  { key: 'week2', label: 'Week 2' },
  { key: 'week3', label: 'Week 3' },
  { key: 'week4', label: 'Week 4' },
];

export function FiveSScoring({ stageId }: FiveScoringProps) {
  const { stages, scoreFiveSZoneWeek } = useAppStore();
  const stage = stages.find((s) => s.id === stageId);
  const [selectedZone, setSelectedZone] = useState<string>(stage?.fiveSZones?.[0]?.id ?? '');
  const [editingScores, setEditingScores] = useState<Record<string, Record<string, number>>>({});

  const zones = stage?.fiveSZones ?? [];
  const currentZone = zones.find((z) => z.id === selectedZone);

  const handleScoreChange = (
    week: string,
    criterion: string,
    value: number
  ) => {
    const key = `${week}-${criterion}`;
    setEditingScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveScores = (week: string) => {
    if (!currentZone) return;

    const scores: FiveSScores = {
      sort: editingScores[`${week}-sort`] ?? currentZone.weeklyScores[week as keyof typeof currentZone.weeklyScores]?.sort ?? 0,
      setInOrder: editingScores[`${week}-setInOrder`] ?? currentZone.weeklyScores[week as keyof typeof currentZone.weeklyScores]?.setInOrder ?? 0,
      shine: editingScores[`${week}-shine`] ?? currentZone.weeklyScores[week as keyof typeof currentZone.weeklyScores]?.shine ?? 0,
      standardize: editingScores[`${week}-standardize`] ?? currentZone.weeklyScores[week as keyof typeof currentZone.weeklyScores]?.standardize ?? 0,
      sustain: editingScores[`${week}-sustain`] ?? currentZone.weeklyScores[week as keyof typeof currentZone.weeklyScores]?.sustain ?? 0,
    };

    scoreFiveSZoneWeek(stageId, currentZone.id, week, scores);
  };

  const getWeekScores = (week: string): FiveSScores | undefined => {
    return currentZone?.weeklyScores[week as keyof typeof currentZone.weeklyScores];
  };

  const calculateAverageScore = (week: string): number => {
    const scores = getWeekScores(week);
    if (!scores) return 0;

    const values = [scores.sort, scores.setInOrder, scores.shine, scores.standardize, scores.sustain];
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(1));
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    if (score >= 2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (!currentZone) {
    return (
      <Card className="p-6 bg-gray-50">
        <p className="text-gray-600 text-sm">No 5S zones configured for this stage.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">5S Scoring</h3>

          {zones.length > 1 && (
            <div className="mb-4">
              <Label className="text-sm text-gray-700 mb-2 block">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-100 px-3 py-2 text-left font-medium text-gray-700">
                  Criterion
                </th>
                {WEEKS.map((week) => (
                  <th
                    key={week.key}
                    className="border border-gray-200 bg-gray-100 px-3 py-2 text-center font-medium text-gray-700"
                  >
                    {week.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIVE_S_CRITERIA.map((criterion) => (
                <tr key={criterion.key}>
                  <td className="border border-gray-200 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900">{criterion.label}</p>
                      <p className="text-xs text-gray-500">{criterion.description}</p>
                    </div>
                  </td>
                  {WEEKS.map((week) => {
                    const scores = getWeekScores(week.key);
                    const score = scores?.[criterion.key as keyof FiveSScores] ?? 0;
                    const editKey = `${week.key}-${criterion.key}`;
                    const editValue = editingScores[editKey];

                    return (
                      <td
                        key={`${criterion.key}-${week.key}`}
                        className="border border-gray-200 bg-white px-3 py-2 text-center"
                      >
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={editValue !== undefined ? editValue : score}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleScoreChange(week.key, criterion.key, val);
                          }}
                          onBlur={() => handleSaveScores(week.key)}
                          className={cn(
                            'w-12 h-8 text-center',
                            getScoreColor(editValue !== undefined ? editValue : score)
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-200 px-3 py-2">Average Score</td>
                {WEEKS.map((week) => (
                  <td
                    key={`avg-${week.key}`}
                    className="border border-gray-200 px-3 py-2 text-center"
                  >
                    <span
                      className={cn(
                        'px-2 py-1 rounded font-medium',
                        getScoreColor(calculateAverageScore(week.key))
                      )}
                    >
                      {calculateAverageScore(week.key)}/5
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <p className="font-medium mb-1">Scoring Guide:</p>
          <ul className="space-y-1 text-xs">
            <li>5 = Excellent: All criteria fully met and sustained</li>
            <li>4 = Good: Criteria met with minor gaps</li>
            <li>3 = Fair: Criteria partially met</li>
            <li>2 = Poor: Significant gaps in implementation</li>
            <li>1 = Very Poor: Criteria largely unmet</li>
            <li>0 = Not Applicable: Not yet assessed</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
