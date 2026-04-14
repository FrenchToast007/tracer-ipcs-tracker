import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { RoleEntry, RiskItem, AuditFindingConnection } from '@/data/types';
import { cn } from '@/lib/utils';

interface ReferencePanelProps {
  guidingPrinciples?: string[];
  roles?: RoleEntry[];
  risks?: RiskItem[];
  auditFindings?: AuditFindingConnection[];
}

export function ReferencePanel({
  guidingPrinciples = [],
  roles = [],
  risks = [],
  auditFindings = [],
}: ReferencePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContent =
    guidingPrinciples.length > 0 ||
    roles.length > 0 ||
    risks.length > 0 ||
    auditFindings.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
      >
        <h3 className="font-semibold text-gray-900">Reference Materials</h3>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="p-4">
          <Tabs defaultValue="principles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {guidingPrinciples.length > 0 && (
                <TabsTrigger value="principles" className="text-xs sm:text-sm">
                  Principles
                </TabsTrigger>
              )}
              {roles.length > 0 && (
                <TabsTrigger value="roles" className="text-xs sm:text-sm">
                  Roles
                </TabsTrigger>
              )}
              {risks.length > 0 && (
                <TabsTrigger value="risks" className="text-xs sm:text-sm">
                  Risks
                </TabsTrigger>
              )}
              {auditFindings.length > 0 && (
                <TabsTrigger value="findings" className="text-xs sm:text-sm">
                  Audit
                </TabsTrigger>
              )}
            </TabsList>

            {guidingPrinciples.length > 0 && (
              <TabsContent value="principles" className="space-y-3 mt-4">
                <ol className="space-y-2">
                  {guidingPrinciples.map((principle, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 font-semibold text-gray-600 w-6">
                        {idx + 1}.
                      </span>
                      <span className="text-gray-700">{principle}</span>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            )}

            {roles.length > 0 && (
              <TabsContent value="roles" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Role
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Person
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Responsibilities
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {role.role}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{role.person}</td>
                          <td className="px-3 py-2 text-gray-600">
                            <ul className="text-xs space-y-1">
                              {role.responsibilities.map((resp, ridx) => (
                                <li key={ridx} className="flex gap-2">
                                  <span className="text-gray-400">•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}

            {risks.length > 0 && (
              <TabsContent value="risks" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Risk
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Mitigation
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Owner
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks.map((risk, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {risk.risk}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {risk.mitigation}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{risk.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}

            {auditFindings.length > 0 && (
              <TabsContent value="findings" className="space-y-3 mt-4">
                <div className="space-y-2">
                  {auditFindings.map((finding, idx) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="font-medium text-gray-900">{finding.finding}</div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Connection:</span> {finding.connection}
                        </div>
                        <div className="text-xs">
                          <Badge variant="outline">{finding.stageRelevance}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}
