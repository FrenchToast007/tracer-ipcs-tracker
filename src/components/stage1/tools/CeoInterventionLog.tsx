// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import type { CeoInterventionEntry } from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

const todayISO = () => new Date().toISOString().slice(0, 10);

interface Props {
  stageId: string;
  entries: CeoInterventionEntry[];
  canEdit: boolean;
}

const emptyForm = (): Omit<CeoInterventionEntry, 'id'> => ({
  date: todayISO(),
  override: '',
  rationale: '',
  downstreamImpact: '',
  followUpAction: '',
  followUpOwner: '',
});

export const CeoInterventionLog: React.FC<Props> = ({
  stageId,
  entries,
  canEdit,
}) => {
  const [form, setForm] = useState<Omit<CeoInterventionEntry, 'id'>>(emptyForm());

  const add = () => {
    if (!form.override.trim()) return;
    updateStageArray<CeoInterventionEntry>(stageId, 'ceoInterventionLog', (arr) => [
      { ...form, id: newRowId('s1-ceo') },
      ...arr,
    ]);
    setForm(emptyForm());
  };

  const update = (id: string, patch: Partial<CeoInterventionEntry>) =>
    updateStageArray<CeoInterventionEntry>(stageId, 'ceoInterventionLog', (arr) =>
      arr.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );

  const remove = (id: string) =>
    updateStageArray<CeoInterventionEntry>(stageId, 'ceoInterventionLog', (arr) =>
      arr.filter((e) => e.id !== id)
    );

  // Weekly count for the headline KPI
  const nowMs = Date.now();
  const weekCount = entries.filter(
    (e) => nowMs - new Date(e.date).getTime() < 7 * 24 * 3600 * 1000
  ).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">CEO Intervention Log</p>
            <p className="text-xs text-slate-500">
              Every CEO override on production sequencing gets logged here —
              date, override, rationale, downstream impact, follow-up. Goal
              per Rec 4.5: trend this count down over time.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{weekCount}</p>
            <p className="text-xs text-slate-500">overrides past 7 days</p>
          </div>
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
            <div className="md:col-span-5">
              <label className="text-xs text-slate-600">Override (what the CEO changed)</label>
              <Input
                value={form.override}
                onChange={(e) => setForm({ ...form, override: e.target.value })}
                placeholder="e.g. Moved Job XY-12 ahead of ABC-07 in Thursday schedule"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-600">Rationale</label>
              <Input
                value={form.rationale}
                onChange={(e) => setForm({ ...form, rationale: e.target.value })}
                placeholder="Why the override was made"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-600">Downstream impact</label>
              <Input
                value={form.downstreamImpact}
                onChange={(e) => setForm({ ...form, downstreamImpact: e.target.value })}
                placeholder="Which jobs shifted, which commitments slipped"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-600">Follow-up action</label>
              <Input
                value={form.followUpAction}
                onChange={(e) => setForm({ ...form, followUpAction: e.target.value })}
                placeholder="What we'll do so this doesn't recur"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-600">Follow-up owner</label>
              <Input
                value={form.followUpOwner}
                onChange={(e) => setForm({ ...form, followUpOwner: e.target.value })}
                placeholder="Role / name"
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={add} className="h-9">Log intervention</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Override</th>
                <th className="p-2">Rationale</th>
                <th className="p-2">Downstream impact</th>
                <th className="p-2">Follow-up / owner</th>
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-4 text-center text-slate-400 text-sm">
                    No CEO interventions logged yet.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 align-top">
                  <td className="p-2 whitespace-nowrap text-slate-700">{e.date.slice(0, 10)}</td>
                  <td className="p-2 text-slate-900">
                    {canEdit ? (
                      <Input
                        value={e.override}
                        onChange={(ev) => update(e.id, { override: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.override
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    {canEdit ? (
                      <Input
                        value={e.rationale}
                        onChange={(ev) => update(e.id, { rationale: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.rationale
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    {canEdit ? (
                      <Input
                        value={e.downstreamImpact}
                        onChange={(ev) => update(e.id, { downstreamImpact: ev.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      e.downstreamImpact
                    )}
                  </td>
                  <td className="p-2 text-slate-700">
                    {canEdit ? (
                      <div className="flex gap-1">
                        <Input
                          value={e.followUpAction}
                          onChange={(ev) => update(e.id, { followUpAction: ev.target.value })}
                          placeholder="Action"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={e.followUpOwner}
                          onChange={(ev) => update(e.id, { followUpOwner: ev.target.value })}
                          placeholder="Owner"
                          className="h-8 text-sm w-28"
                        />
                      </div>
                    ) : (
                      <span>
                        {e.followUpAction}
                        {e.followUpOwner ? ` — ${e.followUpOwner}` : ''}
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
