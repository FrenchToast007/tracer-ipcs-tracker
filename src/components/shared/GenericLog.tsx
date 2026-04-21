// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export type LogFieldType = 'text' | 'date' | 'number' | 'select' | 'checkbox' | 'textarea';

export interface LogField {
  key: string;
  label: string;
  type: LogFieldType;
  options?: string[];      // for type=select
  placeholder?: string;
  required?: boolean;
  width?: string;          // tailwind width class, e.g. 'w-28'
  showInTable?: boolean;   // default true
}

export interface GenericLogProps {
  stageId: string;
  logKey: string;           // the key inside stage.stageLogs
  title?: string;
  hint?: string;
  fields: LogField[];
  rowIdPrefix?: string;
  canEdit: boolean;
  entries: Array<Record<string, any>>;
  summaryText?: (entries: any[]) => string;  // optional text for the header right side
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function renderCell(
  field: LogField,
  value: any,
  canEdit: boolean,
  onChange: (v: any) => void
) {
  if (!canEdit) {
    if (field.type === 'checkbox') return <Checkbox checked={!!value} disabled />;
    return <span>{value === undefined || value === '' ? '—' : String(value)}</span>;
  }
  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <Input
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 text-sm ${field.width ?? ''}`}
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={(value ?? '').slice(0, 10)}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 text-sm ${field.width ?? 'w-36'}`}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className={`h-8 text-sm ${field.width ?? 'w-24'}`}
        />
      );
    case 'select':
      return (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 text-sm border border-slate-200 rounded px-2 ${field.width ?? ''}`}
        >
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return <Checkbox checked={!!value} onCheckedChange={(v) => onChange(!!v)} />;
  }
}

export const GenericLog: React.FC<GenericLogProps> = ({
  stageId,
  logKey,
  title,
  hint,
  fields,
  rowIdPrefix,
  canEdit,
  entries,
  summaryText,
}) => {
  const emptyForm = () => {
    const f: Record<string, any> = {};
    fields.forEach((fld) => {
      if (fld.type === 'date') f[fld.key] = new Date().toISOString().slice(0, 10);
      else if (fld.type === 'checkbox') f[fld.key] = false;
      else f[fld.key] = '';
    });
    return f;
  };
  const [form, setForm] = useState<Record<string, any>>(emptyForm());

  const mutate = (updater: (arr: any[]) => any[]) => {
    useAppStore.setState((prev: any) => ({
      stages: prev.stages.map((s: any) => {
        if (s.id !== stageId) return s;
        const logs = { ...(s.stageLogs ?? {}) };
        logs[logKey] = updater(logs[logKey] ?? []);
        return { ...s, stageLogs: logs };
      }),
    }));
  };

  const add = () => {
    const required = fields.filter((f) => f.required);
    for (const f of required) {
      if (form[f.key] === undefined || form[f.key] === '' || form[f.key] === null) return;
    }
    mutate((arr) => [{ id: newId(rowIdPrefix ?? `${logKey}`), ...form }, ...arr]);
    setForm(emptyForm());
  };

  const update = (id: string, patch: Record<string, any>) =>
    mutate((arr) => arr.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const remove = (id: string) => mutate((arr) => arr.filter((e) => e.id !== id));

  const tableFields = fields.filter((f) => f.showInTable !== false);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {(title || hint || summaryText) && (
          <div className="flex items-center justify-between gap-4">
            <div>
              {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
              {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>
            {summaryText && (
              <p className="text-sm text-slate-700 font-semibold whitespace-nowrap">
                {summaryText(entries)}
              </p>
            )}
          </div>
        )}

        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.type === 'textarea' ? 'md:col-span-6' : 'md:col-span-2'}
              >
                <label className="text-xs text-slate-600">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {renderCell(field, form[field.key], true, (v) =>
                  setForm({ ...form, [field.key]: v })
                )}
              </div>
            ))}
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={add} className="h-9 gap-2">
                <Plus className="w-4 h-4" />
                Log entry
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                {tableFields.map((f) => (
                  <th key={f.key} className="p-2">{f.label}</th>
                ))}
                {canEdit && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={tableFields.length + (canEdit ? 1 : 0)}
                    className="p-4 text-center text-slate-400 text-sm"
                  >
                    No entries yet.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 align-top">
                  {tableFields.map((f) => (
                    <td key={f.key} className="p-2 text-slate-800">
                      {renderCell(f, e[f.key], canEdit, (v) => update(e.id, { [f.key]: v }))}
                    </td>
                  ))}
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
