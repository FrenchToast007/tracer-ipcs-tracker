import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CrossRefChip } from './CrossRefChip';
import type { Activity } from '@/data/types';

export interface ActivityToolJump {
  key: string;        // e.g. 'huddle', 'redtag', 'fives'
  label: string;      // e.g. 'Open Huddle Log'
  targetId: string;   // DOM id to scroll to
}

export interface ActivityDetailCardProps {
  activity: Activity;
  isSelected: boolean;
  onToggle: (activityId: string, newStatus: string) => void;
  onOpenReference: (type: 'sop' | 'finding' | 'rec', id: string) => void;
  toolJumps?: ActivityToolJump[];
}

const jumpToElement = (targetId: string) => {
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('ring-4', 'ring-yellow-400');
    setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400'), 2000);
  }
};

export const ActivityDetailCard: React.FC<ActivityDetailCardProps> = ({
  activity,
  isSelected,
  onToggle,
  onOpenReference,
  toolJumps,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const fiveStepConfig: Record<string, { label: string; color: string }> = {
    sort: { label: 'S1 Sort', color: 'bg-red-500' },
    setInOrder: { label: 'S2 Set in Order', color: 'bg-blue-500' },
    shine: { label: 'S3 Shine', color: 'bg-green-500' },
    standardize: { label: 'S4 Standardise', color: 'bg-purple-500' },
    sustain: { label: 'S5 Sustain', color: 'bg-amber-500' },
  };

  const handleStatusChange = () => {
    const nextStatus = isSelected ? 'pending' : 'done';
    onToggle(activity.id, nextStatus);
  };

  const step = activity.fiveStep ? fiveStepConfig[activity.fiveStep] : null;

  return (
    <Card
      className={`mb-4 transition-all ${isSelected ? 'ring-2 ring-green-400 bg-green-50' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleStatusChange}
            className="mt-1"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{activity.description}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {activity.time && <span>{activity.time} • </span>}
                  <span>{activity.owner}</span>
                  {activity.duration && <span> • {activity.duration} min</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(activity.status)}>
                  {activity.status}
                </Badge>
                {step && (
                  <Badge
                    className={`text-white ${step.color}`}
                    title="5S step"
                  >
                    {step.label}
                  </Badge>
                )}
                {activity.isBlitz && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    BLITZ
                  </Badge>
                )}
              </div>
            </div>

            {activity.successLooksLike && (
              <div className="mt-3 p-2 bg-blue-50 border-l-2 border-blue-400 rounded">
                <p className="text-xs font-medium text-slate-700">Success looks like:</p>
                <p className="text-xs text-slate-600 mt-1">{activity.successLooksLike}</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {toolJumps && toolJumps.length > 0 && (
          <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
            <p className="text-xs font-semibold text-amber-900 mb-2 uppercase tracking-wide">
              Tools this task uses — click to jump to it
            </p>
            <div className="flex flex-wrap gap-2">
              {toolJumps.map((jump) => (
                <button
                  key={jump.key}
                  onClick={() => jumpToElement(jump.targetId)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100 border-2 border-amber-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {jump.label}
                  <ArrowDown className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activity.detailSteps && activity.detailSteps.length > 0 && (
          <div>
            <h5 className="font-medium text-slate-900 text-sm mb-2">Steps:</h5>
            <ol className="list-decimal list-inside space-y-2">
              {activity.detailSteps.map((step, i) => (
                <li key={i} className="text-sm text-slate-700 ml-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {activity.commonMistakes && activity.commonMistakes.length > 0 && (
          <div>
            <h5 className="font-medium text-slate-900 text-sm mb-2">Common Mistakes:</h5>
            <ul className="list-disc list-inside space-y-1">
              {activity.commonMistakes.map((mistake, i) => (
                <li key={i} className="text-sm text-red-700 ml-2">
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activity.deliverable && (
          <div className="p-2 bg-slate-100 rounded">
            <p className="text-xs font-medium text-slate-700">Deliverable:</p>
            <p className="text-sm text-slate-800">{activity.deliverable}</p>
          </div>
        )}

        {activity.location && (
          <p className="text-xs text-slate-600">
            <span className="font-medium">Location:</span> {activity.location}
          </p>
        )}

        <div className="space-y-3 pt-2 border-t">
          {activity.relatedZones && activity.relatedZones.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Related Zones:</p>
              <div className="flex flex-wrap gap-2">
                {activity.relatedZones.map((zoneId) => (
                  <CrossRefChip
                    key={zoneId}
                    type="zone"
                    id={zoneId}
                    label={`Zone ${zoneId.split('-')[1].toUpperCase()}`}
                  />
                ))}
              </div>
            </div>
          )}

          {activity.relatedSupplies && activity.relatedSupplies.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Related Supplies:</p>
              <div className="flex flex-wrap gap-2">
                {activity.relatedSupplies.map((supplyId) => (
                  <CrossRefChip
                    key={supplyId}
                    type="supply"
                    id={supplyId}
                    label={`Supply ${supplyId.split('-')[2]}`}
                  />
                ))}
              </div>
            </div>
          )}

          {activity.sopRefs && activity.sopRefs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">SOPs:</p>
              <div className="flex flex-wrap gap-2">
                {activity.sopRefs.map((sopId) => (
                  <CrossRefChip
                    key={sopId}
                    type="sop"
                    id={sopId}
                    label={sopId}
                    onClick={() => onOpenReference('sop', sopId)}
                  />
                ))}
              </div>
            </div>
          )}

          {activity.findingRefs && activity.findingRefs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Findings:</p>
              <div className="flex flex-wrap gap-2">
                {activity.findingRefs.map((findingId) => (
                  <CrossRefChip
                    key={findingId}
                    type="finding"
                    id={findingId}
                    label={`Finding ${findingId}`}
                    onClick={() => onOpenReference('finding', findingId)}
                  />
                ))}
              </div>
            </div>
          )}

          {activity.recRefs && activity.recRefs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Recommendations:</p>
              <div className="flex flex-wrap gap-2">
                {activity.recRefs.map((recId) => (
                  <CrossRefChip
                    key={recId}
                    type="rec"
                    id={recId}
                    label={`Rec ${recId}`}
                    onClick={() => onOpenReference('rec', recId)}
                  />
                ))}
              </div>
            </div>
          )}

          {activity.wasteRefs && activity.wasteRefs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Related Wastes:</p>
              <div className="flex flex-wrap gap-2">
                {activity.wasteRefs.map((waste) => (
                  <CrossRefChip
                    key={waste}
                    type="waste"
                    id={waste}
                    label={waste}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {activity.notes && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-medium text-yellow-800">Notes:</p>
            <p className="text-xs text-yellow-700 mt-1">{activity.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
