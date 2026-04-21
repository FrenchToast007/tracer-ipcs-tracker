// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { TrainingRow } from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

interface Props {
  stageId: string;
  rows: TrainingRow[];
  canEdit: boolean;
}

export const TrainingVerification: React.FC<Props> = ({
  stageId,
  rows,
  canEdit,
}) => {
  const [newLead, setNewLead] = useState('');

  const addRow = () => {
    const name = newLead.trim();
    if (!name) return;
    updateStageArray<TrainingRow>(stageId, 'trainingRows', (arr) => [
      ...arr,
      {
        id: newRowId('s1-train'),
        leadName: name,
        demonstratedLocate: false,
        demonstratedUpdate: false,
        demonstratedEscalate: false,
      },
    ]);
    setNewLead('');
  };

  const update = (id: string, patch: Partial<TrainingRow>) =>
    updateStageArray<TrainingRow>(stageId, 'trainingRows', (arr) =>
      arr.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );

  const remove = (id: string) =>
    updateStageArray<TrainingRow>(stageId, 'trainingRows', (arr) => arr.filter((r) => r.id !== id));

  const isVerified = (r: TrainingRow) =>
    r.demonstratedLocate && r.demonstratedUpdate && r.demonstratedEscalate && (r.verifiedBy ?? '').trim().length > 0;

  const verified = rows.filter(isVerified).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Training Verification (Hands-on, Live Job)
            </p>
            <p className="text-xs text-slate-500">
              Each lead demonstrates — on a real active job, not a practice
              case — that they can (1) locate a job record, (2) update it,
              (3) walk an escalation. Consultant signs each off individually.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{verified}/{rows.length}</p>
            <p className="text-xs text-slate-500">leads verified</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Lead</th>
                <th className="p-2">Session date</th>
                <th className="p-2">Live job used</th>
                <th className="p-2 text-center">Locate</th>
                <th className="p-2 text-center">Update</th>
                <th className="p-2 text-center">Escalate</th>
                <th className="p-2">Verified by</th>
                <th className="p-2 text-center">Status</th>
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const ok = isVerified(r);
                return (
                  <tr key={r.id} className="border-t border-slate-100 align-top">
                    <td className="p-2 font-medium text-slate-900">
                      {canEdit ? (
                        <Input
                          value={r.leadName}
                          onChange={(e) => update(r.id, { leadName: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        r.leadName
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          type="date"
                          value={(r.sessionDate ?? '').slice(0, 10)}
                          onChange={(e) => update(r.id, { sessionDate: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        (r.sessionDate ?? '—').slice(0, 10)
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={r.liveJobUsed ?? ''}
                          placeholder="Job ID"
                          onChange={(e) => update(r.id, { liveJobUsed: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        r.liveJobUsed ?? '—'
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={r.demonstratedLocate}
                        onCheckedChange={(v) => update(r.id, { demonstratedLocate: !!v })}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={r.demonstratedUpdate}
                        onCheckedChange={(v) => update(r.id, { demonstratedUpdate: !!v })}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={r.demonstratedEscalate}
                        onCheckedChange={(v) => update(r.id, { demonstratedEscalate: !!v })}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={r.verifiedBy ?? ''}
                          placeholder="Consultant name"
                          onChange={(e) => update(r.id, { verifiedBy: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        r.verifiedBy ?? '—'
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ok ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-red-600 h-7 w-7 p-0"
                          onClick={() => remove(r.id)}
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Input
              placeholder="Add another lead (role — name)"
              value={newLead}
              onChange={(e) => setNewLead(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRow()}
              className="h-9"
            />
            <Button onClick={addRow} className="h-9 gap-2">
              <Plus className="w-4 h-4" />
              Add lead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
