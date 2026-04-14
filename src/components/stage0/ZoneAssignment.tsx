import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlantZone } from '@/data/types';
import { cn } from '@/lib/utils';

interface ZoneAssignmentProps {
  zones: PlantZone[];
  onUpdate: (zoneId: string, updates: Partial<PlantZone>) => void;
  canEdit?: boolean;
  activityReferenceCounts?: Record<string, number>;
}

const ZONE_COLORS = {
  A: 'bg-red-100 border-red-300',
  B: 'bg-blue-100 border-blue-300',
  C: 'bg-green-100 border-green-300',
  D: 'bg-yellow-100 border-yellow-300',
  E: 'bg-purple-100 border-purple-300',
  F: 'bg-pink-100 border-pink-300',
  G: 'bg-indigo-100 border-indigo-300',
};

const ZONE_BADGE_COLORS = {
  A: 'bg-red-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-500 text-white',
  D: 'bg-yellow-500 text-gray-900',
  E: 'bg-purple-500 text-white',
  F: 'bg-pink-500 text-white',
  G: 'bg-indigo-500 text-white',
};

export function ZoneAssignment({ 
  zones, 
  onUpdate, 
  canEdit = true,
  activityReferenceCounts = {} 
}: ZoneAssignmentProps) {
  const [editingTeamLead, setEditingTeamLead] = useState<{ [key: string]: string }>({});
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const handleTeamLeadChange = (zoneId: string, value: string) => {
    setEditingTeamLead((prev) => ({
      ...prev,
      [zoneId]: value,
    }));
  };

  const handleSaveTeamLead = (zone: PlantZone) => {
    onUpdate(zone.id, { teamLead: editingTeamLead[zone.id] || zone.teamLead });
    setEditingTeamLead((prev) => {
      const newState = { ...prev };
      delete newState[zone.id];
      return newState;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Zone Assignments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const colorClass = ZONE_COLORS[zone.letter as keyof typeof ZONE_COLORS] || ZONE_COLORS.A;
          const badgeColorClass = ZONE_BADGE_COLORS[zone.letter as keyof typeof ZONE_BADGE_COLORS] || ZONE_BADGE_COLORS.A;
          const currentTeamLead = editingTeamLead[zone.id] !== undefined ? editingTeamLead[zone.id] : zone.teamLead;
          const isEditing = zone.id in editingTeamLead;
          const refCount = activityReferenceCounts[zone.id] || 0;

          return (
            <div
              key={zone.id}
              id={`zone-${zone.id}`}
              className={cn(
                'border rounded-lg p-4 space-y-3 transition-all',
                colorClass
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm', badgeColorClass)}>
                  {zone.letter}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{zone.name}</div>
                  {zone.description && (
                    <div className="text-xs text-gray-600">{zone.description}</div>
                  )}
                </div>
              </div>

              {zone.keyContents.length > 0 && (
                <div className="bg-white/50 rounded p-2 space-y-1">
                  <div className="text-xs font-medium text-gray-700">Key Contents:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {zone.keyContents.map((content, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <div className="text-xs font-medium text-gray-700">Team Lead</div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      value={currentTeamLead}
                      onChange={(e) => handleTeamLeadChange(zone.id, e.target.value)}
                      placeholder="Enter team lead name"
                      className="h-8 text-sm"
                    />
                    <Button
                      onClick={() => handleSaveTeamLead(zone)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-8"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (canEdit) {
                        handleTeamLeadChange(zone.id, currentTeamLead);
                      }
                    }}
                    className={cn(
                      'text-sm bg-white/70 rounded px-2 py-1 text-gray-700',
                      canEdit && 'cursor-pointer hover:bg-white'
                    )}
                  >
                    {currentTeamLead || '—'}
                  </div>
                )}
              </div>

              {refCount > 0 && (
                <div className="pt-2 border-t border-white/50">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Referenced in {refCount}</span> activities
                  </div>
                </div>
              )}

              {isEditing && (
                <Button
                  onClick={() => setEditingTeamLead((prev) => {
                    const newState = { ...prev };
                    delete newState[zone.id];
                    return newState;
                  })}
                  variant="outline"
                  size="sm"
                  className="w-full h-8"
                >
                  Cancel
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
