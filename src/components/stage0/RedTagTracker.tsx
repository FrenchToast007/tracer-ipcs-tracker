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
import type { RedTagItem, PlantZone, RedTagDisposition } from '@/data/types';
import { cn } from '@/lib/utils';

interface RedTagTrackerProps {
  tags: RedTagItem[];
  zones: PlantZone[];
  onAdd: (tag: Omit<RedTagItem, 'id'>) => void;
  onDispose: (tagId: string, disposition: 'discard' | 'relocate' | 'store') => void;
  canEdit: boolean;
}

const DISPOSITION_COLORS: Record<RedTagDisposition, string> = {
  pending: 'bg-blue-100 text-blue-800 border-blue-300',
  discard: 'bg-red-100 text-red-800 border-red-300',
  relocate: 'bg-amber-100 text-amber-800 border-amber-300',
  store: 'bg-green-100 text-green-800 border-green-300',
};

const DISPOSITION_LABELS: Record<RedTagDisposition, string> = {
  pending: 'Pending',
  discard: 'Discard',
  relocate: 'Relocate',
  store: 'Store',
};

export function RedTagTracker({
  tags,
  zones,
  onAdd,
  onDispose,
  canEdit,
}: RedTagTrackerProps) {
  const [itemName, setItemName] = useState('');
  const [zone, setZone] = useState('');
  const [reason, setReason] = useState('');
  const [expandedResolved, setExpandedResolved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !zone || !reason) return;

    onAdd({
      zone,
      item: itemName,
      reason,
      disposition: 'pending',
      taggedAt: new Date().toISOString(),
    });

    setItemName('');
    setZone('');
    setReason('');
  };

  const pendingTags = tags.filter((t) => t.disposition === 'pending');
  const resolvedTags = tags.filter((t) => t.disposition !== 'pending');

  const discardCount = tags.filter((t) => t.disposition === 'discard').length;
  const relocateCount = tags.filter((t) => t.disposition === 'relocate').length;
  const storeCount = tags.filter((t) => t.disposition === 'store').length;

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
      <h3 className="text-lg font-semibold text-gray-900">Red Tag Tracker</h3>

      {canEdit && (
        <form onSubmit={handleSubmit} className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Add Red Tag</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="What item needs tagging?"
                className="h-9"
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for Red Tagging
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this item red tagged?"
              className="min-h-20 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={!itemName || !zone || !reason}
          >
            Add Red Tag
          </Button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{pendingTags.length}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{storeCount}</div>
          <div className="text-xs text-gray-600">Store</div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Discard:</span>
            <span className="font-bold text-red-600">{discardCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Relocate:</span>
            <span className="font-bold text-amber-600">{relocateCount}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Pending Tags ({pendingTags.length})</h4>
        {pendingTags.length > 0 ? (
          <div className="space-y-2">
            {pendingTags.map((tag) => {
              const tagZone = zones.find((z) => z.id === tag.zone);
              return (
                <div key={tag.id} className="border rounded-lg p-3 space-y-2 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-gray-900">{tag.item}</div>
                      <div className="text-sm text-gray-600">
                        Zone {tagZone?.letter} - {tagZone?.name}
                      </div>
                      <p className="text-sm text-gray-600">{tag.reason}</p>
                      <p className="text-xs text-gray-500">{formatDate(tag.taggedAt)}</p>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onDispose(tag.id, 'discard')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={() => onDispose(tag.id, 'relocate')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        Relocate
                      </Button>
                      <Button
                        onClick={() => onDispose(tag.id, 'store')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Store
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            No pending red tags
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
                        <div>
                          <div className="font-medium text-gray-900">{tag.item}</div>
                          <div className="text-xs text-gray-600">
                            Zone {tagZone?.letter} - {tagZone?.name}
                          </div>
                        </div>
                        <Badge className={cn('h-fit', DISPOSITION_COLORS[tag.disposition])}>
                          {DISPOSITION_LABELS[tag.disposition]}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs">{tag.reason}</p>
                      <p className="text-xs text-gray-500">
                        Disposed: {tag.disposedAt ? formatDate(tag.disposedAt) : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No resolved red tags
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
