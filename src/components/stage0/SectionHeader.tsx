import React from 'react';
import { ArrowDown } from 'lucide-react';

interface SectionHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  whatToDo: string;
  nextAnchor?: string;
  nextLabel?: string;
}

const scrollToAnchor = (anchor: string) => {
  const el = document.getElementById(anchor);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('ring-4', 'ring-yellow-400');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-yellow-400');
    }, 2000);
  }
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  stepNumber,
  totalSteps,
  title,
  whatToDo,
  nextAnchor,
  nextLabel,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
          {stepNumber}
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Step {stepNumber} of {totalSteps}
          </p>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-r">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-blue-900">What to do here: </span>
          {whatToDo}
        </p>
      </div>
    </div>
  );
};

interface NextStepLinkProps {
  nextAnchor: string;
  nextLabel: string;
}

export const NextStepLink: React.FC<NextStepLinkProps> = ({ nextAnchor, nextLabel }) => {
  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => {
          const el = document.getElementById(nextAnchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.classList.add('ring-4', 'ring-yellow-400');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-yellow-400');
            }, 2000);
          }
        }}
        className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors"
      >
        Next: {nextLabel}
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  );
};
