import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { MaintenanceTag, PlantZone, TagPriority } from '@/data/types';
import { cn } from '@/lib/utils';

interface MaintenanceTagLogProps {
  tags: MaintenanceTag[];
  zones: PlantZone[];
  onAdd: (tag: Omit<MaintenanceTag, 'id'>) => void;
  onResolve: (tagId: string) => void;
  canEdit: boolean;
}

const PRIORITY_COLORS: Record<TagPriority, string> = {
  S: 'bg-green-100 text-green-800 border-green-300',
  M: 'bg-amber-100 text-amber-800 border-amber-300',
  L: 'bg-red-100 text-red-800 border-red-300',
};

const PRIORITY_LABELS: Record<TagPriority, string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
};

export function MaintenanceTagLog({
  tags,
  zones,
  onAdd,
  onResolve,
  canEdit,
}: MaintenanceTagLogProps) {
  const [zone, setZone] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TagPriority>('M');
  const [expandedResolved, setExpandedResolved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone || !location || !description) return;

    onAdd({
      zone,
      location,
      description,
      priority,
      resolved: false,
      createdAt: new Date().toISOString(),
    });

    setZone('');
    setLocation('');
    setDescription('');
    setPriority('M');
  };

  const openTags = tags.filter((t) => !t.resolved);
  const resolvedTags = tags.filter((t) => t.resolved);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Maintenance Tag Log</h3>

      {canEdit && (
        <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Add Maintenance Tag</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Zone</label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      Zone {z.letter} - {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Assembly line A"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the maintenance issue"
              className="min-h-20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TagPriority)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">Small</SelectItem>
                <SelectItem value="M">Medium</SelectItem>
                <SelectItem value="L">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!zone || !location || !description}
          >
            Add Tag
          </Button>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
          <div className="text-xs text-gray-600">Total Tags</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-amber-600">{openTags.length}</div>
          <div className="text-xs text-gray-600">Open</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{resolvedTags.length}</div>
          <div className="text-xs text-gray-600">Resolved</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Open Tags ({openTags.length})</h4>
        {openTags.length > 0 ? (
          <div className="space-y-2">
            {openTags.map((tag) => {
              const tagZone = zones.find((z) => z.id === tag.zone);
              return (
                <div key={tag.id} className="border rounded-lg p-3 space-y-2 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {tagZone?.letter} - {tag.location}
                        </span>
                        <Badge className={cn('h-fit', PRIORITY_COLORS[tag.priority])}>
                          {PRIORITY_LABELS[tag.priority]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{tag.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(tag.createdAt)}</p>
                    </div>
                    {canEdit && (
                      <Button
                        onClick={() => onResolve(tag.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 ml-2"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            No open maintenance tags
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedResolved(!expandedResolved)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-medium text-gray-900">
            Resolved Tags ({resolvedTags.length})
          </h4>
          {expandedResolved ? (
            <ChevronUp size={20} className="text-gray-600" />
          ) : (
            <ChevronDown size={20} className="text-gray-600" />
          )}
        </button>

        {expandedResolved && (
          <div className="border-t space-y-2 p-3 bg-gray-50">
            {resolvedTags.length > 0 ? (
              <div className="space-y-2">
                {resolvedTags.map((tag) => {
                  const tagZone = zones.find((z) => z.id === tag.zone);
                  return (
                    <div key={tag.id} className="border rounded bg-white p-2 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {tagZone?.letter} - {tag.location}
                        </span>
                        <Badge className={cn('h-fit text-xs', PRIORITY_COLORS[tag.priority])}>
                          {PRIORITY_LABELS[tag.priority]}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{tag.description}</p>
                      <p className="text-xs text-gray-500">
                        Resolved: {tag.resolvedAt ? formatDate(tag.resolvedAt) : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No resolved maintenance tags
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
