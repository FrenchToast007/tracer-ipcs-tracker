// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { ComplianceRow } from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

interface Props {
  stageId: string;
  rows: ComplianceRow[];
  canEdit: boolean;
}

export const ComplianceTracker: React.FC<Props> = ({
  stageId,
  rows,
  canEdit,
}) => {
  const [newName, setNewName] = useState('');

  const addRow = () => {
    const name = newName.trim();
    if (!name) return;
    updateStageArray<ComplianceRow>(stageId, 'complianceRows', (arr) => [
      ...arr,
      {
        id: newRowId('s1-comp'),
        projectName: name,
        jobIdApplied: false,
        mandatoryFields: false,
        filedCorrectly: false,
        latestRevisionVisible: false,
      },
    ]);
    setNewName('');
  };

  const update = (id: string, patch: Partial<ComplianceRow>) =>
    updateStageArray<ComplianceRow>(stageId, 'complianceRows', (arr) =>
      arr.map((r) =>
        r.id === id ? { ...r, ...patch, checkedAt: new Date().toISOString() } : r
      )
    );

  const remove = (id: string) =>
    updateStageArray<ComplianceRow>(stageId, 'complianceRows', (arr) => arr.filter((r) => r.id !== id));

  const isCompliant = (r: ComplianceRow) =>
    r.jobIdApplied && r.mandatoryFields && r.filedCorrectly && r.latestRevisionVisible;

  const compliant = rows.filter(isCompliant).length;
  const compliancePct = rows.length === 0 ? 0 : Math.round((compliant / rows.length) * 100);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Job Record Compliance Tracker
            </p>
            <p className="text-xs text-slate-500">
              One row per active project. A project is compliant only when all
              four boxes are checked. Exit Criterion #1 requires 100%.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{compliancePct}%</p>
            <p className="text-xs text-slate-500">{compliant}/{rows.length} compliant</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Input
              placeholder="Add active project (e.g. ABC-042)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRow()}
              className="h-9"
            />
            <Button onClick={addRow} className="h-9 gap-2">
              <Plus className="w-4 h-4" />
              Add project
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Project</th>
                <th className="p-2 text-center">Naming applied</th>
                <th className="p-2 text-center">Mandatory fields</th>
                <th className="p-2 text-center">Filed correctly</th>
                <th className="p-2 text-center">Latest rev visible</th>
                <th className="p-2">Notes</th>
                <th className="p-2 text-center">Status</th>
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="p-4 text-center text-slate-400 text-sm">
                    No projects tracked yet. Add each active project to monitor compliance.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const ok = isCompliant(r);
                return (
                  <tr key={r.id} className="border-t border-slate-100 align-top">
                    <td className="p-2 font-medium text-slate-900">
                      {canEdit ? (
                        <Input
                          value={r.projectName}
                          onChange={(e) => update(r.id, { projectName: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        r.projectName
                      )}
                    </td>
                    {(['jobIdApplied', 'mandatoryFields', 'filedCorrectly', 'latestRevisionVisible'] as const).map((key) => (
                      <td key={key} className="p-2 text-center">
                        <Checkbox
                          checked={r[key]}
                          onCheckedChange={(v) => update(r.id, { [key]: !!v } as Partial<ComplianceRow>)}
                          disabled={!canEdit}
                        />
                      </td>
                    ))}
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={r.notes ?? ''}
                          onChange={(e) => update(r.id, { notes: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        r.notes ?? <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ok ? 'Compliant' : 'Gap'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-red-600 h-7 w-7 p-0"
                          onClick={() => remove(r.id)}
                          title="Delete project"
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
      </CardContent>
    </Card>
  );
};
