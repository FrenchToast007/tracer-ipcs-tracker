// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import type {
  PriorityLogEntry,
  PriorityLogKind,
  PriorityLogOutcome,
  PriorityTier,
} from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

const KIND_LABELS: Record<PriorityLogKind, string> = {
  priority_change: 'Priority change',
  escalation: 'Escalation',
  stop_the_line: 'Stop-the-line',
  urgent_request: 'Urgent request',
};

const OUTCOME_LABELS: Record<PriorityLogOutcome, string> = {
  resolved: 'Resolved',
  escalated: 'Escalated up',
  rejected: 'Rejected',
  pending: 'Pending',
};

const outcomeColor = (o: PriorityLogOutcome): string => {
  switch (o) {
    case 'resolved':  return 'bg-emerald-100 text-emerald-800';
    case 'escalated': return 'bg-amber-100 text-amber-800';
    case 'rejected':  return 'bg-red-100 text-red-800';
    case 'pending':   return 'bg-slate-100 text-slate-700';
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

interface Props {
  stageId: string;
  entries: PriorityLogEntry[];
  canEdit: boolean;
}

const emptyForm = (): Omit<PriorityLogEntry, 'id'> => ({
  date: todayISO(),
  kind: 'priority_change',
  requester: '',
  tier: 'P2',
  justification: '',
  approver: '',
  outcome: 'pending',
  notes: '',
});

export const PriorityEscalationLog: React.FC<Props> = ({
  stageId,
  entries,
  canEdit,
}) => {
  const [form, setForm] = useState<Omit<PriorityLogEntry, 'id'>>(emptyForm());

  const addEntry = () => {
    if (!form.requester.trim() || !form.justification.trim()) return;
    updateStageArray<PriorityLogEntry>(stageId, 'priorityLog', (arr) => [
      { ...form, id: newRowId('s1-prio') },
      ...arr,
    ]);
    setForm(emptyForm());
  };

  const update = (id: string, patch: Partial<PriorityLogEntry>) =>
    updateStageArray<PriorityLogEntry>(stageId, 'priorityLog', (arr) =>
      arr.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const remove = (id: string) =>
    updateStageArray<PriorityLogEntry>(stageId, 'priorityLog', (arr) => arr.filter((e) => e.id !== id));

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Priority &amp; Escalation Intake Log
          </p>
          <p className="text-xs text-slate-500">
            Every priority change, escalation, stop-the-line event, and urgent
            request goes here — per SOP-23 (Priority Rules) and SOP-24
            (Escalation Ladder). If it didn't get logged, it didn't happen.
          </p>
        </div>

        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            <div>
              <label className="text-xs text-slate-600">Date</label>
              <Input
                type="date"
                value={form.date.slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Kind</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as PriorityLogKind })}
                className="h-9 w-full text-sm border border-slate-200 rounded px-2"
              >
                {(Object.keys(KIND_LABELS) as PriorityLogKind[]).map((k) => (
                  <option key={k} value={k}>{KIND_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Tier</label>
              <select
                value={form.tier ?? ''}
                onChange={(e) => setForm({ ...form, tier: e.target.value as PriorityTier })}
                className="h-9 w-full text-sm border border-slate-200 rounded px-2"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-600">Requester</label>
              <Input
                value={form.requester}
                onChange={(e) => setForm({ ...form, requester: e.target.value })}
                placeholder="Who is asking"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Approver</label>
              <Input
                value={form.approver ?? ''}
                onChange={(e) => setForm({ ...form, approver: e.target.value })}
                placeholder="Role / name"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-6">
              <label className="text-xs text-slate-600">
                Justification / what happened
              </label>
              <Input
                value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })}
                placeholder="e.g. Site team reported P1 shutdown risk on Job ABC-042 at 15:00"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={addEntry} className="h-9">
                Log entry
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Kind</th>
                <th className="p-2">Tier</th>
                <th className="p-2">Requester</th>
                <th className="p-2">Justification</th>
                <th className="p-2">Approver</th>
                <th className="p-2">Outcome</th>
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="p-4 text-center text-slate-400 text-sm">
                    No entries yet. Log priority changes, escalations, and urgent requests as they happen.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 align-top">
                  <td className="p-2 whitespace-nowrap text-slate-700">{e.date.slice(0, 10)}</td>
                  <td className="p-2 text-slate-700">{KIND_LABELS[e.kind]}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                      {e.tier ?? '—'}
                    </span>
                  </td>
                  <td className="p-2 text-slate-900">{e.requester}</td>
                  <td className="p-2 text-slate-700">{e.justification}</td>
                  <td className="p-2 text-slate-700">{e.approver || '—'}</td>
                  <td className="p-2">
                    {canEdit ? (
                      <select
                        value={e.outcome}
                        onChange={(ev) => update(e.id, { outcome: ev.target.value as PriorityLogOutcome })}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 ${outcomeColor(e.outcome)}`}
                      >
                        {(Object.keys(OUTCOME_LABELS) as PriorityLogOutcome[]).map((o) => (
                          <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${outcomeColor(e.outcome)}`}>
                        {OUTCOME_LABELS[e.outcome]}
                      </span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-600 h-7 w-7 p-0"
                        onClick={() => remove(e.id)}
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
