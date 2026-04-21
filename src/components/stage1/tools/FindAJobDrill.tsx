// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { FindAJobEntry } from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

interface Props {
  stageId: string;
  entries: FindAJobEntry[];
  canEdit: boolean;
}

const PASS_THRESHOLD = 60; // seconds, per audit Exit Criterion #3

const emptyForm = (): Omit<FindAJobEntry, 'id'> => ({
  participantName: '',
  role: '',
  jobQueried: '',
  seconds: undefined,
  passed: undefined,
});

export const FindAJobDrill: React.FC<Props> = ({ stageId, entries, canEdit }) => {
  const [form, setForm] = useState<Omit<FindAJobEntry, 'id'>>(emptyForm());

  const add = () => {
    const name = form.participantName.trim();
    if (!name) return;
    const passed =
      form.seconds !== undefined && form.seconds !== null
        ? form.seconds <= PASS_THRESHOLD
        : undefined;
    updateStageArray<FindAJobEntry>(stageId, 'findAJobEntries', (arr) => [
      ...arr,
      { ...form, id: newRowId('s1-drill'), passed },
    ]);
    setForm(emptyForm());
  };

  const update = (id: string, patch: Partial<FindAJobEntry>) => {
    updateStageArray<FindAJobEntry>(stageId, 'findAJobEntries', (arr) =>
      arr.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (merged.seconds !== undefined && merged.seconds !== null) {
          merged.passed = merged.seconds <= PASS_THRESHOLD;
        }
        return merged;
      })
    );
  };

  const remove = (id: string) =>
    updateStageArray<FindAJobEntry>(stageId, 'findAJobEntries', (arr) => arr.filter((r) => r.id !== id));

  const passed = entries.filter((e) => e.passed === true).length;
  const attempted = entries.filter((e) => e.seconds != null).length;
  const avg = attempted
    ? Math.round(entries.filter((e) => e.seconds != null).reduce((s, e) => s + (e.seconds ?? 0), 0) / attempted)
    : 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Find-a-Job Drill (target: under 60 seconds)
            </p>
            <p className="text-xs text-slate-500">
              Pick 8 people — include at least 2 who don't touch Basecamp daily.
              Name a real active job; time how long it takes them to produce
              the latest approved plan set using only the standard structure.
              Audit Exit Criterion #3 requires every participant under 60s.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {passed}/{entries.length}
            </p>
            <p className="text-xs text-slate-500">
              passed · avg {avg || '—'}s
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div>
              <label className="text-xs text-slate-600">Name</label>
              <Input
                value={form.participantName}
                onChange={(e) => setForm({ ...form, participantName: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Role</label>
              <Input
                value={form.role ?? ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Job queried</label>
              <Input
                value={form.jobQueried ?? ''}
                onChange={(e) => setForm({ ...form, jobQueried: e.target.value })}
                placeholder="Job ID"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Seconds</label>
              <Input
                type="number"
                min="0"
                value={form.seconds ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seconds: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={add} className="h-9 gap-2">
                <Plus className="w-4 h-4" />
                Log
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Participant</th>
                <th className="p-2">Role</th>
                <th className="p-2">Job</th>
                <th className="p-2 text-center">Seconds</th>
                <th className="p-2 text-center">Pass</th>
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-4 text-center text-slate-400 text-sm">
                    No timings logged yet.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="p-2 text-slate-900 font-medium">
                    {canEdit ? (
                      <Input
                        value={e.participantName}
                        onChange={(ev) => update(e.id, { participantName: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.participantName
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    {canEdit ? (
                      <Input
                        value={e.role ?? ''}
                        onChange={(ev) => update(e.id, { role: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.role ?? '—'
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    {canEdit ? (
                      <Input
                        value={e.jobQueried ?? ''}
                        onChange={(ev) => update(e.id, { jobQueried: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.jobQueried ?? '—'
                    )}
                  </td>
                  <td className="p-2 text-center text-slate-900 font-semibold">
                    {canEdit ? (
                      <Input
                        type="number"
                        min="0"
                        value={e.seconds ?? ''}
                        onChange={(ev) =>
                          update(e.id, {
                            seconds: ev.target.value === '' ? undefined : Number(ev.target.value),
                          })
                        }
                        className="h-8 text-sm w-20 text-center"
                      />
                    ) : (
                      e.seconds ?? '—'
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        e.passed === true
                          ? 'bg-emerald-100 text-emerald-800'
                          : e.passed === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {e.passed === true ? 'Pass' : e.passed === false ? 'Fail' : '—'}
                    </span>
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
