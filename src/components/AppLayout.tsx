import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';
import type { Stage } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { currentUser, stages, logout } = useAppStore();

  const handleLogout = async () => {
    // End the Supabase session first so AuthGate drops us back to the
    // login screen. Clear the local store regardless, in case signOut
    // fails (e.g. already expired or offline).
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AppLayout] supabase signOut error', err);
    }
    logout();
    navigate('/');
  };

  // Derive initials from whatever name we have (real user name, falling back
  // to email localpart). Tolerant of missing or single-word names so no user
  // ever sees a blank avatar bubble.
  const initialsFor = (name: string | undefined | null): string => {
    const safe = (name && name.trim()) || 'User';
    const parts = safe.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Translate a role string into a readable label. Covers the predefined
  // enum values plus any free-form role (e.g. 'admin') an org may set in
  // Supabase by capitalizing and spacing camelCase.
  const roleLabelFor = (role: string | undefined | null): string => {
    if (!role) return '';
    switch (role) {
      case 'plantManager':
        return 'Plant Manager';
      case 'ceo':
        return 'CEO';
      case 'cfo':
        return 'CFO';
      case 'projectManager':
        return 'Project Manager';
      case 'siteManager':
        return 'Site Manager';
      case 'consultant':
        return 'Consultant';
      case 'admin':
        return 'Admin';
      default:
        // Split camelCase / snake_case / kebab-case and title-case.
        return role
          .replace(/[_-]+/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
    }
  };

  const getStageTruncatedSubtitle = (subtitle: string | undefined): string => {
    if (!subtitle) return '';
    if (subtitle.length > 30) {
      return subtitle.substring(0, 27) + '...';
    }
    return subtitle;
  };

  const getOverallProgressPercent = (): number => {
    if (stages.length === 0) return 0;
    const totalCompletion = stages.reduce((sum: number, stage: Stage) => {
      return sum + stage.completionPercent;
    }, 0);
    return Math.round(totalCompletion / stages.length);
  };

  // Sidebar content
  const SidebarContent = () => (
    <>
      {/* Brand Block */}
      <div className={sidebarExpanded ? 'px-4 py-6' : 'px-2 py-6'}>
        <div
          className={`flex items-center ${
            sidebarExpanded ? 'justify-between gap-2' : 'justify-center'
          }`}
        >
          {sidebarExpanded ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-slate-900 truncate">
                  IPCS Tracker
                </p>
                <p className="text-xs text-slate-600 mt-1">Tracer</p>
              </div>
              <button
                onClick={() => setSidebarExpanded(false)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            // Collapsed rail: show compact mark instead of wrapping full name
            <div
              className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm"
              title="IPCS Tracker"
            >
              IP
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Overall Progress */}
      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-slate-600 mb-2">
          Overall Progress
        </p>
        <Progress value={getOverallProgressPercent()} className="h-2 mb-1" />
        <p className="text-xs text-slate-600">{getOverallProgressPercent()}%</p>
      </div>

      <Separator />

      {/* Dashboard Link */}
      <div className="px-2 py-2">
        <Link href="/">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              location === '/'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {sidebarExpanded && <span className="text-sm font-medium">Dashboard</span>}
          </button>
        </Link>
      </div>

      <Separator />

      {/* Stages Section */}
      <div className="px-2 py-3">
        {sidebarExpanded && (
          <p className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">
            Stages
          </p>
        )}
      </div>

      {/* Stage List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {stages.map((stage: Stage) => {
            const locked = stage.status === 'locked';
            const content = (
              <>
                {/* Stage Number Badge */}
                <div className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {stage.number}
                </div>

                {/* Stage Info */}
                {sidebarExpanded && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {stage.title}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {getStageTruncatedSubtitle(stage.subtitle)}
                    </p>
                  </div>
                )}
              </>
            );

            // Locked stages render as a plain disabled button (no navigation).
            // Unlocked stages render as wouter Link-wrapped anchors, matching
            // the Dashboard link pattern that is known to work reliably.
            if (locked) {
              return (
                <button
                  key={stage.id}
                  className="w-full flex items-start gap-2 p-3 rounded-lg text-left cursor-not-allowed opacity-60 text-slate-400"
                  disabled
                >
                  {content}
                </button>
              );
            }
            return (
              <Link key={stage.id} href={`/stage/${stage.id}`}>
                <a
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-start gap-2 p-3 rounded-lg transition-colors text-left cursor-pointer hover:bg-slate-100 text-slate-700 no-underline"
                >
                  {content}
                </a>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      {/* User Profile Bottom */}
      <div className="px-4 py-4 space-y-4">
        {sidebarExpanded && currentUser && (
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {initialsFor(currentUser.name)}
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser.name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {roleLabelFor(currentUser.role as unknown as string)}
              </p>
            </div>
          </div>
        )}

        {/* Log Out Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          {sidebarExpanded && <span>Log out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarExpanded ? 'w-[280px]' : 'w-[64px]'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[280px] bg-white border-r border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-200 flex items-center px-4 gap-4 bg-white">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle */}
          {!sidebarExpanded && (
            <button
              className="hidden md:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
