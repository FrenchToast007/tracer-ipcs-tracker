// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { GovernanceArtifact, ArtifactStatus } from '@/data/types';
import { updateStageArray } from './stage1Store';

const STATUS_OPTIONS: { value: ArtifactStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not started', color: 'bg-slate-100 text-slate-700' },
  { value: 'draft',       label: 'Draft',       color: 'bg-amber-100 text-amber-800' },
  { value: 'in_review',   label: 'In review',   color: 'bg-blue-100 text-blue-800' },
  { value: 'signed',      label: 'Signed',      color: 'bg-emerald-100 text-emerald-800' },
  { value: 'posted',      label: 'Posted',      color: 'bg-green-100 text-green-800' },
];

interface Props {
  stageId: string;
  artifacts: GovernanceArtifact[];
  canEdit: boolean;
}

export const GovernanceArtifactsTracker: React.FC<Props> = ({
  stageId,
  artifacts,
  canEdit,
}) => {
  const update = (id: string, patch: Partial<GovernanceArtifact>) =>
    updateStageArray<GovernanceArtifact>(stageId, 'governanceArtifacts', (arr) =>
      arr.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      )
    );

  const completed = artifacts.filter(
    (a) => a.status === 'signed' || a.status === 'posted'
  ).length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-900">
            Governance Artifacts Tracker
          </p>
          <p className="text-sm text-slate-600">
            {completed}/{artifacts.length} signed or posted
          </p>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Every document, template, and poster Stage 1 creates lives here.
          Flip each to Draft as you start it, then In Review, then Signed
          (charter, RACI, tiers, ladder) or Posted (naming, folders, glossary,
          templates, huddle board).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-2">Artifact</th>
                <th className="p-2">Owner</th>
                <th className="p-2">Status</th>
                <th className="p-2">Version</th>
                <th className="p-2">Link</th>
                <th className="p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((a) => {
                const statusCfg = STATUS_OPTIONS.find((s) => s.value === a.status) ?? STATUS_OPTIONS[0];
                return (
                  <tr key={a.id} className="border-t border-slate-100 align-top">
                    <td className="p-2 font-medium text-slate-900">{a.name}</td>
                    <td className="p-2 text-slate-700">
                      {canEdit ? (
                        <Input
                          value={a.owner}
                          onChange={(e) => update(a.id, { owner: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        a.owner
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <select
                          value={a.status}
                          onChange={(e) =>
                            update(a.id, { status: e.target.value as ArtifactStatus })
                          }
                          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer border-0 ${statusCfg.color}`}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={a.version}
                          onChange={(e) => update(a.id, { version: e.target.value })}
                          className="h-8 text-sm w-20"
                        />
                      ) : (
                        a.version
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={a.link ?? ''}
                          placeholder="Basecamp / URL"
                          onChange={(e) => update(a.id, { link: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : a.link ? (
                        <a href={a.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          open
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-2">
                      {canEdit ? (
                        <Input
                          value={a.notes ?? ''}
                          onChange={(e) => update(a.id, { notes: e.target.value })}
                          className="h-8 text-sm"
                        />
                      ) : (
                        a.notes ?? <span className="text-slate-400">—</span>
                      )}
                    </td>
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
