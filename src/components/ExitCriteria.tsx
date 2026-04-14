import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExitCriterion } from '@/data/types';
import { cn } from '@/lib/utils';

interface ExitCriteriaProps {
  stageId: string;
  criteria: ExitCriterion[];
  canEdit: boolean;
  color: string;
}

export function ExitCriteria({ stageId, criteria, canEdit, color }: ExitCriteriaProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [signOffDialog, setSignOffDialog] = useState(false);
  const [signerName, setSignerName] = useState('');
  const { updateExitCriterion, signOffStage, stages } = useAppStore();

  const stage = stages.find((s) => s.id === stageId);
  const metCount = criteria.filter((c) => c.met).length;
  const allMet = criteria.length > 0 && metCount === criteria.length;
  const progressPercent = criteria.length > 0 ? (metCount / criteria.length) * 100 : 0;

  const handleSignOff = () => {
    if (signerName.trim()) {
      signOffStage(stageId, signerName.trim());
      setSignOffDialog(false);
      setSignerName('');
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      emerald: 'bg-emerald-50 border-emerald-200',
      purple: 'bg-purple-50 border-purple-200',
      amber: 'bg-amber-50 border-amber-200',
      rose: 'bg-rose-50 border-rose-200',
      indigo: 'bg-indigo-50 border-indigo-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  const getHeaderColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-600',
      purple: 'bg-purple-600',
      amber: 'bg-amber-600',
      rose: 'bg-rose-600',
      indigo: 'bg-indigo-600',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', getColorClasses(color))}>
      <div className={cn('text-white px-4 py-3 font-semibold', getHeaderColorClasses(color))}>
        Exit Criteria
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Progress</label>
            <span className="text-sm text-gray-600">
              {metCount} of {criteria.length} met
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-3">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={criterion.met}
                  onCheckedChange={(checked) => {
                    updateExitCriterion(stageId, criterion.id, checked as boolean);
                  }}
                  disabled={!canEdit}
                  className="mt-1"
                />

                <div className="flex-1">
                  <p
                    className={cn('font-medium', {
                      'text-gray-900 line-through': criterion.met,
                      'text-gray-900': !criterion.met,
                    })}
                  >
                    {criterion.description}
                  </p>

                  {criterion.evidenceRequired && (
                    <p className="text-sm text-gray-500 mt-1">
                      Evidence: {criterion.evidenceRequired}
                    </p>
                  )}

                  {criterion.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <p className="font-medium text-gray-800 mb-1">Notes:</p>
                      <p>{criterion.notes}</p>
                    </div>
                  )}

                  {canEdit && (
                    <button
                      onClick={() =>
                        setExpandedNotes(
                          expandedNotes === criterion.id ? null : criterion.id
                        )
                      }
                      className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1"
                    >
                      {expandedNotes === criterion.id ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Hide notes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Add/edit notes
                        </>
                      )}
                    </button>
                  )}

                  {expandedNotes === criterion.id && canEdit && (
                    <div className="mt-3">
                      <Textarea
                        value={criterion.notes ?? ''}
                        onChange={(e) => {
                          updateExitCriterion(stageId, criterion.id, criterion.met, e.target.value);
                        }}
                        placeholder="Add notes about this criterion..."
                        className="text-sm h-20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {allMet && (
          <div className="border-t pt-4 mt-4">
            {stage?.signedOffAt ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">
                  Signed off by {stage.signedOffBy} on{' '}
                  {new Date(stage.signedOffAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 mb-3">
                  All criteria met! Ready to sign off this stage.
                </p>
                <Button
                  onClick={() => setSignOffDialog(true)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Sign Off Stage
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={signOffDialog} onOpenChange={setSignOffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Off Stage</DialogTitle>
            <DialogDescription>
              Enter your name to officially sign off this stage as complete.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signer-name">Your Name</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSignOff();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignOff} disabled={!signerName.trim()}>
              Confirm Sign Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
