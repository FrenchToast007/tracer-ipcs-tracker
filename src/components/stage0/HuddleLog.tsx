import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, Trash2 } from 'lucide-react';
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
import type { HuddleLogEntry } from '@/data/types';

interface HuddleLogProps {
  logs: HuddleLogEntry[];
  onAdd: (entry: Omit<HuddleLogEntry, 'id'>) => void;
  onDelete?: (entryId: string) => void;
  canEdit: boolean;
  currentUserName: string;
}

export function HuddleLog({
  logs,
  onAdd,
  onDelete,
  canEdit,
  currentUserName,
}: HuddleLogProps) {
  const [week, setWeek] = useState<string>('1');
  const [safety, setSafety] = useState('');
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [problems, setProblems] = useState('');
  const [helpNeeded, setHelpNeeded] = useState('');
  const [shoutout, setShoutout] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAdd({
      date: new Date().toISOString(),
      week: parseInt(week, 10),
      facilitator: currentUserName,
      safety,
      yesterday,
      today,
      problems,
      helpNeeded,
      shoutout,
    });

    setSafety('');
    setYesterday('');
    setToday('');
    setProblems('');
    setHelpNeeded('');
    setShoutout('');
    setWeek('1');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Calculate huddle streak
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today_date = new Date();
  today_date.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today_date);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Huddle Log</h3>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            <Flame size={16} />
            {streak} day streak
          </div>
        )}
      </div>

      {canEdit && (
        <form onSubmit={handleSubmit} className="border border-purple-200 bg-purple-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">6-Point Daily Huddle Script</h4>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Week</label>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Week 1</SelectItem>
                <SelectItem value="2">Week 2</SelectItem>
                <SelectItem value="3">Week 3</SelectItem>
                <SelectItem value="4">Week 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              1. Safety Topic
            </label>
            <Input
              value={safety}
              onChange={(e) => setSafety(e.target.value)}
              placeholder="What safety topic should we focus on?"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              2. Yesterday's Achievements
            </label>
            <Textarea
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              placeholder="What did we accomplish?"
              className="min-h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              3. Today's Plan
            </label>
            <Textarea
              value={today}
              onChange={(e) => setToday(e.target.value)}
              placeholder="What are we doing today?"
              className="min-h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              4. Problems/Blockers
            </label>
            <Textarea
              value={problems}
              onChange={(e) => setProblems(e.target.value)}
              placeholder="What's blocking us?"
              className="min-h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              5. Help Needed
            </label>
            <Textarea
              value={helpNeeded}
              onChange={(e) => setHelpNeeded(e.target.value)}
              placeholder="What support do we need?"
              className="min-h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              6. Shoutout
            </label>
            <Input
              value={shoutout}
              onChange={(e) => setShoutout(e.target.value)}
              placeholder="Who or what deserves recognition?"
              className="h-9"
            />
          </div>

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!safety || !yesterday || !today}
          >
            Submit Huddle Log
          </Button>
        </form>
      )}

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Entry History</h4>
        {sortedLogs.length > 0 ? (
          <div className="space-y-2">
            {sortedLogs.map((log) => (
              <div key={log.id} className="border rounded-lg bg-white overflow-hidden">
                <div className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() =>
                      setExpandedEntryId(expandedEntryId === log.id ? null : log.id)
                    }
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {formatDate(log.date)} - Week {log.week}
                      </div>
                      <div className="text-sm text-gray-600">
                        Facilitated by {log.facilitator}
                      </div>
                    </div>
                    {expandedEntryId === log.id ? (
                      <ChevronUp size={20} className="text-gray-600 ml-2" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600 ml-2" />
                    )}
                  </button>
                  {canEdit && onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete this huddle log (${formatDate(log.date)}, Week ${log.week})? This cannot be undone.`
                          )
                        ) {
                          onDelete(log.id);
                        }
                      }}
                      className="ml-2 p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete this huddle log"
                      aria-label="Delete this huddle log"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {expandedEntryId === log.id && (
                  <div className="border-t bg-gray-50 p-3 space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">1. Safety Topic</div>
                      <div className="text-gray-600">{log.safety}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">
                        2. Yesterday's Achievements
                      </div>
                      <div className="text-gray-600 whitespace-pre-wrap">
                        {log.yesterday}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">3. Today's Plan</div>
                      <div className="text-gray-600 whitespace-pre-wrap">
                        {log.today}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">4. Problems/Blockers</div>
                      <div className="text-gray-600 whitespace-pre-wrap">
                        {log.problems}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">5. Help Needed</div>
                      <div className="text-gray-600 whitespace-pre-wrap">
                        {log.helpNeeded}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">6. Shoutout</div>
                      <div className="text-gray-600">{log.shoutout}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No huddle logs recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
