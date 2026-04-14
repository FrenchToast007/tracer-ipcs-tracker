import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, Package, AlertCircle, BookOpen, Lightbulb } from 'lucide-react';

export interface CrossRefChipProps {
  type: 'zone' | 'supply' | 'sop' | 'finding' | 'rec' | 'kpi' | 'exit' | 'activity' | 'waste';
  id: string;
  label: string;
  onClick?: () => void;
}

export const CrossRefChip: React.FC<CrossRefChipProps> = ({
  type,
  id,
  label,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'zone':
        return <MapPin className="w-3 h-3" />;
      case 'supply':
        return <Package className="w-3 h-3" />;
      case 'sop':
        return <FileText className="w-3 h-3" />;
      case 'finding':
        return <AlertCircle className="w-3 h-3" />;
      case 'rec':
        return <Lightbulb className="w-3 h-3" />;
      case 'kpi':
      case 'exit':
      case 'activity':
        return <BookOpen className="w-3 h-3" />;
      case 'waste':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'zone':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'supply':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'sop':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'finding':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'rec':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'kpi':
      case 'exit':
        return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      case 'activity':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'waste':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === 'zone') {
      const element = document.getElementById(`zone-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-4', 'ring-yellow-300');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-yellow-300');
        }, 1500);
      }
    } else if (type === 'supply') {
      const element = document.getElementById(`supply-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-4', 'ring-yellow-300');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-yellow-300');
        }, 1500);
      }
    } else {
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${getColor()}`}
      title={`${type}: ${label}`}
    >
      {getIcon()}
      <span>{label}</span>
    </button>
  );
};
