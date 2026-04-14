import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { EIGHT_WASTES } from '@/data/stage0References';

export const EightWastesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-base text-orange-900">
                  8 Wastes Reference
                </CardTitle>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-orange-600 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="text-sm text-slate-600 mb-4">
              The 8 wastes are types of activities that add cost or time but no value. Recognizing
              these helps teams identify improvement opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EIGHT_WASTES.map((waste, i) => (
                <div key={i} className="border border-orange-200 rounded-lg p-3 bg-white">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    {i + 1}. {waste.name}
                  </h4>
                  <p className="text-xs text-slate-600">{waste.definition}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-4 italic">
              Use these wastes as a shared vocabulary when discussing improvements and auditing
              processes.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
