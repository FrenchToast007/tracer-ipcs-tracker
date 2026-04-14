import { useState } from 'react';
import { useAppStore, DEMO_USERS, ROLE_LABELS, ROLE_COLORS } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Shield,
  BarChart3,
  ClipboardList,
  HardHat,
  Search,
} from 'lucide-react';
import type { UserRole } from '@/data/types';

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ size: number; className?: string }>> = {
  plantManager: HardHat,
  ceo: Shield,
  cfo: BarChart3,
  projectManager: ClipboardList,
  siteManager: User,
  consultant: Search,
};

const ROLE_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  rose: 'bg-rose-100 text-rose-700 border-rose-300',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

const ROLE_ICON_BG: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  indigo: 'bg-indigo-500',
};

export function Login() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const login = useAppStore((state) => state.login);

  const handleContinue = () => {
    const user = DEMO_USERS.find((u) => u.id === selectedUserId);
    if (user) {
      login(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Tracer IPCS Tracker
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Implementation Progress & Control System
          </p>
        </div>

        {/* User Selection Grid */}
        <div className="mb-8">
          <p className="text-slate-600 font-medium mb-6 text-center">
            Select a persona to continue:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_USERS.map((user) => {
              const roleColor = ROLE_COLORS[user.role];
              const IconComponent = ROLE_ICONS[user.role];
              const isSelected = selectedUserId === user.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`transition-all duration-200 transform ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                >
                  <Card
                    className={`cursor-pointer h-full ${
                      isSelected
                        ? 'bg-slate-50 border-slate-300 shadow-lg'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      {/* Avatar Circle */}
                      <div
                        className={`w-20 h-20 rounded-full ${ROLE_ICON_BG[roleColor]} flex items-center justify-center`}
                      >
                        <IconComponent size={40} className="text-white" />
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-semibold text-slate-900">
                        {user.name}
                      </h3>

                      {/* Role Badge */}
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          ROLE_COLOR_CLASSES[roleColor]
                        }`}
                      >
                        {ROLE_LABELS[user.role]}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedUserId}
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
          >
            {selectedUserId
              ? `Continue as ${DEMO_USERS.find((u) => u.id === selectedUserId)?.name}`
              : 'Select a user to continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
