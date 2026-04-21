// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { RaciRow, RaciValue } from '@/data/types';
import { updateStageArray, newRowId } from './stage1Store';

const VALUES: RaciValue[] = ['', 'R', 'A', 'C', 'I'];

const cellStyle = (v: RaciValue): string => {
  switch (v) {
    case 'R': return 'bg-blue-50 text-blue-900 font-semibold';
    case 'A': return 'bg-emerald-50 text-emerald-900 font-semibold';
    case 'C': return 'bg-amber-50 text-amber-900';
    case 'I': return 'bg-slate-50 text-slate-700';
    default:  return 'bg-white text-slate-400';
  }
};

interface Props {
  stageId: string;
  rows: RaciRow[];
  columns: string[];
  canEdit: boolean;
}

export const RaciMatrix: React.FC<Props> = ({
  stageId,
  rows,
  columns,
  canEdit,
}) => {
  const [newDecision, setNewDecision] = useState('');

  const updateRow = (id: string, patch: Partial<RaciRow>) =>
    updateStageArray<RaciRow>(stageId, 'raciRows', (arr) =>
      arr.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );

  const updateCell = (id: string, col: string, value: RaciValue) =>
    updateRow(id, {
      values: { ...(rows.find((r) => r.id === id)?.values ?? {}), [col]: value },
    });

  const addRow = () => {
    const decision = newDecision.trim();
    if (!decision) return;
    const blankValues: Record<string, RaciValue> = {};
    columns.forEach((c) => (blankValues[c] = ''));
    updateStageArray<RaciRow>(stageId, 'raciRows', (arr) => [
      ...arr,
      { id: newRowId('s1-raci'), decision, values: blankValues },
    ]);
    setNewDecision('');
  };

  const deleteRow = (id: string) =>
    updateStageArray<RaciRow>(stageId, 'raciRows', (arr) => arr.filter((r) => r.id !== id));

  const multiAccountable = rows.some(
    (r) => Object.values(r.values).filter((v) => v === 'A').length > 1
  );
  const missingAccountable = rows.some(
    (r) => !Object.values(r.values).some((v) => v === 'A')
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-900">RACI Matrix</p>
          <p className="text-xs text-slate-500">
            R Responsible · A Accountable · C Consulted · I Informed
          </p>
        </div>

        {(multiAccountable || missingAccountable) && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            {missingAccountable && <p>• At least one decision has no Accountable. Every row needs exactly one A.</p>}
            {multiAccountable && <p>• One or more decisions have multiple Accountables. Pick one.</p>}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2 border-b border-slate-200">Decision class</th>
                {columns.map((c) => (
                  <th key={c} className="p-2 border-b border-slate-200 text-center">
                    {c}
                  </th>
                ))}
                {canEdit && <th className="p-2 border-b border-slate-200"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="p-2 font-medium text-slate-900">
                    {canEdit ? (
                      <Input
                        value={r.decision}
                        onChange={(e) => updateRow(r.id, { decision: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      r.decision
                    )}
                  </td>
                  {columns.map((col) => {
                    const v = r.values[col] ?? '';
                    return (
                      <td key={col} className={`p-1 text-center ${cellStyle(v)}`}>
                        {canEdit ? (
                          <select
                            value={v}
                            onChange={(e) => updateCell(r.id, col, e.target.value as RaciValue)}
                            className={`w-full h-8 text-center text-sm font-semibold border-0 bg-transparent ${cellStyle(v)}`}
                          >
                            {VALUES.map((val) => (
                              <option key={val || 'blank'} value={val}>
                                {val || '—'}
                              </option>
                            ))}
                          </select>
                        ) : (
                          v || '—'
                        )}
                      </td>
                    );
                  })}
                  {canEdit && (
                    <td className="p-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-600 h-7 w-7 p-0"
                        onClick={() => deleteRow(r.id)}
                        title="Delete row"
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

        {canEdit && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add a new decision class (e.g. Closeout sign-off)"
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRow()}
              className="h-9"
            />
            <Button onClick={addRow} className="gap-2 h-9">
              <Plus className="w-4 h-4" />
              Add decision
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
