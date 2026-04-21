import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SOPS, FINDINGS, RECOMMENDATIONS } from '@/data/stage0References';
import {
  STAGE1_SOPS,
  STAGE1_FINDINGS,
  STAGE1_RECOMMENDATIONS,
} from '@/data/stage1References';
import {
  EXTENDED_SOPS,
  EXTENDED_FINDINGS,
  EXTENDED_RECS,
} from '@/data/stagesExtendedReferences';

// The reference drawer reads from every stage's reference map.
const ALL_SOPS = { ...SOPS, ...STAGE1_SOPS, ...EXTENDED_SOPS };
const ALL_FINDINGS = { ...FINDINGS, ...STAGE1_FINDINGS, ...EXTENDED_FINDINGS };
const ALL_RECOMMENDATIONS = {
  ...RECOMMENDATIONS,
  ...STAGE1_RECOMMENDATIONS,
  ...EXTENDED_RECS,
};

export interface ReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sop' | 'finding' | 'rec' | null;
  id: string | null;
  returnFocusId?: string | null;
}

export const ReferenceDrawer: React.FC<ReferenceDrawerProps> = ({
  isOpen,
  onClose,
  type,
  id,
  returnFocusId,
}) => {
  const handleClose = () => {
    onClose();
    if (returnFocusId) {
      setTimeout(() => {
        const element = document.getElementById(returnFocusId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  let title = '';
  let content: React.ReactNode = null;

  if (type === 'sop' && id && ALL_SOPS[id]) {
    const sop = ALL_SOPS[id]!;
    title = sop.title;
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">When Followed</h3>
          <p className="text-slate-700 text-sm">{sop.whenFollowed}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">When Not Followed</h3>
          <p className="text-slate-700 text-sm">{sop.whenNotFollowed}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Procedure</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
            {sop.procedure.map((step, i) => (
              <li key={i} className="ml-2">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Tools & Inputs</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
            {sop.tools.map((tool, i) => (
              <li key={i} className="ml-2">
                {tool}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Outputs</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
            {sop.outputs.map((output, i) => (
              <li key={i} className="ml-2">
                {output}
              </li>
            ))}
          </ul>
        </div>

        {sop.faq && sop.faq.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">FAQ</h3>
            <div className="space-y-3">
              {sop.faq.map((item, i) => (
                <div key={i}>
                  <p className="font-medium text-slate-800 text-sm">Q: {item.q}</p>
                  <p className="text-slate-700 text-sm ml-4">A: {item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } else if (type === 'finding' && id && ALL_FINDINGS[id]) {
    const finding = ALL_FINDINGS[id]!;
    title = finding.title;
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">What Is Happening</h3>
          <p className="text-slate-700 text-sm">{finding.what}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Why It Matters</h3>
          <p className="text-slate-700 text-sm">{finding.why}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Connection to Root Cause</h3>
          <p className="text-slate-700 text-sm">{finding.rootCause}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Linked Recommendation</h3>
          <p className="text-slate-700 text-sm font-medium">{finding.linkedRec}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Linked SOPs</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
            {finding.linkedSOPs.map((sop, i) => (
              <li key={i} className="ml-2">
                {sop}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else if (type === 'rec' && id && ALL_RECOMMENDATIONS[id]) {
    const rec = ALL_RECOMMENDATIONS[id]!;
    title = rec.title;
    content = (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-700 text-sm">{rec.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Implementation Details</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
            {rec.implementationDetails.map((detail, i) => (
              <li key={i} className="ml-2">
                {detail}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Minimum Artifacts Required</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
            {rec.minimumArtifacts.map((artifact, i) => (
              <li key={i} className="ml-2">
                {artifact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">{content}</div>

        <div className="mt-6 flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
