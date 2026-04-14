import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { SupplyItem } from '@/data/types';

interface SuppliesChecklistProps {
  supplies: SupplyItem[];
  onToggle: (itemId: string) => void;
  onToggleOrdered?: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, qty: number) => void;
  canEdit?: boolean;
}

export function SuppliesChecklist({
  supplies,
  onToggle,
  onToggleOrdered,
  onUpdateQuantity,
  canEdit = true,
}: SuppliesChecklistProps) {
  const acquiredCount = supplies.filter((item) => item.acquired).length;
  const orderedCount = supplies.filter((item) => item.ordered).length;
  const progressPercent =
    supplies.length > 0 ? Math.round((acquiredCount / supplies.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Supplies Checklist</h3>
      <p className="text-sm text-slate-600">
        Click the Ordered column when you place each order. Click Acquired when the item physically arrives. Change the quantity to match what you actually ordered.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {orderedCount} ordered · {acquiredCount} of {supplies.length} acquired
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Item</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-20">
                  Qty
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Needed By
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-20">
                  Ordered
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-20">
                  Acquired
                </th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((item, idx) => (
                <tr
                  key={item.id}
                  id={`supply-${item.id}`}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.item}</td>
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && canEdit) {
                          onUpdateQuantity(item.id, val);
                        }
                      }}
                      disabled={!canEdit}
                      className="w-16 text-center h-8"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.neededBy}</td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={item.ordered}
                      onCheckedChange={() => {
                        if (canEdit && onToggleOrdered) {
                          onToggleOrdered(item.id);
                        }
                      }}
                      disabled={!canEdit || !onToggleOrdered}
                      className="mx-auto"
                      aria-label={`Mark ${item.item} as ordered`}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={item.acquired}
                      onCheckedChange={() => {
                        if (canEdit) {
                          onToggle(item.id);
                        }
                      }}
                      disabled={!canEdit}
                      className="mx-auto"
                      aria-label={`Mark ${item.item} as acquired`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {supplies.length === 0 && (
        <div className="text-center py-8 text-gray-500">No supplies to track</div>
      )}
    </div>
  );
}
