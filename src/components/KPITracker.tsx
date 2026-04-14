import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { KPI } from '@/data/types';
import { cn } from '@/lib/utils';

interface KPITrackerProps {
  stageId: string;
  kpis: KPI[];
  canEdit: boolean;
  color: string;
}

export function KPITracker({ stageId, kpis, canEdit, color }: KPITrackerProps) {
  const updateKPI = useAppStore((state) => state.updateKPI);

  const getTrendIndicator = (kpi: KPI) => {
    const latestValue = kpi.weeklyValues.week4 ?? kpi.weeklyValues.week3 ?? kpi.weeklyValues.week2 ?? kpi.weeklyValues.week1;

    if (latestValue === undefined) return null;

    const isPositive = kpi.higherIsBetter
      ? latestValue > kpi.baseline
      : latestValue < kpi.baseline;

    return {
      isPositive,
      icon: isPositive ? ArrowUp : ArrowDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
    };
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      emerald: 'bg-emerald-50 border-emerald-200',
      purple: 'bg-purple-50 border-purple-200',
      amber: 'bg-amber-50 border-amber-200',
      rose: 'bg-rose-50 border-rose-200',
      indigo: 'bg-indigo-50 border-indigo-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  const getHeaderColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-600',
      purple: 'bg-purple-600',
      amber: 'bg-amber-600',
      rose: 'bg-rose-600',
      indigo: 'bg-indigo-600',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', getColorClasses(color))}>
      <div className={cn('text-white px-4 py-3 font-semibold', getHeaderColorClasses(color))}>
        Key Performance Indicators
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Unit</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">Baseline</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">Target</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">W1</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">W2</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">W3</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">W4</th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">Trend</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, idx) => {
              const trend = getTrendIndicator(kpi);
              const TrendIcon = trend?.icon;

              return (
                <tr key={kpi.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{kpi.name}</td>
                  <td className="px-4 py-3 text-gray-600">{kpi.unit}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{kpi.baseline}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{kpi.target}</td>
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      value={kpi.weeklyValues.week1 ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateKPI(stageId, kpi.id, 'week1', val);
                      }}
                      disabled={!canEdit}
                      className="w-16 text-center h-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      value={kpi.weeklyValues.week2 ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateKPI(stageId, kpi.id, 'week2', val);
                      }}
                      disabled={!canEdit}
                      className="w-16 text-center h-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      value={kpi.weeklyValues.week3 ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateKPI(stageId, kpi.id, 'week3', val);
                      }}
                      disabled={!canEdit}
                      className="w-16 text-center h-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      value={kpi.weeklyValues.week4 ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateKPI(stageId, kpi.id, 'week4', val);
                      }}
                      disabled={!canEdit}
                      className="w-16 text-center h-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {trend && TrendIcon && (
                        <TrendIcon className={cn('w-5 h-5', trend.color)} />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {kpi.higherIsBetter ? 'Higher' : 'Lower'}
                      </Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
        {kpis.some((k) => k.higherIsBetter) && (
          <p>Green up arrow = improvement, Red down arrow = decline (higher is better)</p>
        )}
        {kpis.some((k) => !k.higherIsBetter) && (
          <p>Green down arrow = improvement, Red up arrow = decline (lower is better)</p>
        )}
      </div>
    </div>
  );
}
