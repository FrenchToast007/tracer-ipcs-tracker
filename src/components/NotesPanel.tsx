import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useAppStore, ROLE_LABELS, ROLE_COLORS } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Priority } from '@/data/types';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  stageId: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'low':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    rose: 'bg-rose-100 text-rose-800 border-rose-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  };
  return colorMap[color] || colorMap.blue;
};

export function NotesPanel({ stageId }: NotesPanelProps) {
  const { currentUser, notes, addNote, deleteNote } = useAppStore();
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stageNotes = notes.filter((n) => n.stageId === stageId);

  const handleAddNote = async () => {
    if (!content.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      addNote({
        stageId,
        content: content.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        priority,
      });

      setContent('');
      setPriority('medium');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDeleteNote = (authorId: string) => {
    return currentUser?.id === authorId;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a note about this stage..."
              className="min-h-24 resize-none"
            />

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Priority
                </label>
                <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddNote}
                disabled={!content.trim() || isSubmitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        </div>

        {stageNotes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Notes ({stageNotes.length})
            </h4>

            <div className="space-y-3">
              {stageNotes
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((note) => {
                  const roleColor = ROLE_COLORS[note.authorRole];

                  return (
                    <div
                      key={note.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{note.authorName}</span>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getRoleColor(roleColor))}
                            >
                              {ROLE_LABELS[note.authorRole]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getPriorityColor(note.priority))}
                            >
                              {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(note.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>

                        {canDeleteNote(note.authorId) && (
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {stageNotes.length === 0 && content === '' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">No notes yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
