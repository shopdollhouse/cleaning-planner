import { Sun, House, Users, Wrench, FileText, Calendar, Zap, type LucideIcon } from 'lucide-react';
import type { TimePeriod } from '@/hooks/useAppState';

export type View = 'daily' | 'deep-clean' | 'challenges' | 'specialty' | 'family-hub' | 'notes' | 'settings';
export type SidebarMode = 'expanded' | 'collapsed';
export type EnergyGroup = 'core' | 'tools' | 'system';

export interface NavPalette {
  accent: string;
  bg: string;
  border: string;
  label: string;
}

export interface NavItem {
  id: View;
  label: string;
  icon: LucideIcon;
  color: string;
  palette: NavPalette;
}

export interface NavGroup {
  id: EnergyGroup;
  label: string;
  tagline: string;
  taglineColor?: string;
  items: NavItem[];
}

export const TIME_PERIODS: TimePeriod[] = ['morning', 'afternoon', 'evening'];
export const SIDEBAR_WIDTH = { expanded: 248, collapsed: 68 } as const;
export const HEADER_OFFSET = 76;

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'core',
    label: 'Core Routines',
    tagline: 'Every-day rhythm',
    taglineColor: 'hsl(350 45% 75%)',
    items: [
      {
        id: 'daily',
        label: 'Daily Routines',
        icon: Sun,
        color: 'hsl(350 45% 75%)',
        palette: {
          accent: 'hsl(350 45% 75%)',
          bg:     'rgba(234, 193, 200, 0.15)',
          border: 'rgba(234, 193, 200, 0.3)',
          label:  '#2D2D3D',
        },
      },
      {
        id: 'deep-clean',
        label: 'Deep Clean',
        icon: House,
        color: 'hsl(165 40% 75%)',
        palette: {
          accent: 'hsl(165 40% 75%)',
          bg:     'rgba(191, 221, 218, 0.15)',
          border: 'rgba(191, 221, 218, 0.3)',
          label:  '#2D2D3D',
        },
      },
      {
        id: 'challenges',
        label: '30-Day Challenge',
        icon: Calendar,
        color: 'hsl(210 50% 75%)',
        palette: {
          accent: 'hsl(210 50% 75%)',
          bg:     'rgba(206, 217, 243, 0.15)',
          border: 'rgba(206, 217, 243, 0.3)',
          label:  '#2D2D3D',
        },
      },
    ],
  },
  {
    id: 'tools',
    label: 'Extra Tools',
    tagline: 'When you need a boost',
    taglineColor: 'hsl(270 35% 75%)',
    items: [
      {
        id: 'specialty',
        label: 'Specialty',
        icon: Zap,
        color: 'hsl(45 60% 75%)',
        palette: {
          accent: 'hsl(45 60% 75%)',
          bg:     'rgba(242, 228, 179, 0.15)',
          border: 'rgba(242, 228, 179, 0.3)',
          label:  '#2D2D3D',
        },
      },
      {
        id: 'family-hub',
        label: 'Family Hub',
        icon: Users,
        color: 'hsl(270 35% 75%)',
        palette: {
          accent: 'hsl(270 35% 75%)',
          bg:     'rgba(223, 198, 228, 0.15)',
          border: 'rgba(223, 198, 228, 0.3)',
          label:  '#2D2D3D',
        },
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: FileText,
        color: 'hsl(340 35% 75%)',
        palette: {
          accent: 'hsl(340 35% 75%)',
          bg:     'rgba(229, 193, 211, 0.15)',
          border: 'rgba(229, 193, 211, 0.3)',
          label:  '#2D2D3D',
        },
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    tagline: 'Tweaks & data',
    taglineColor: 'hsl(160 60% 75%)',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: Wrench,
        color: 'hsl(160 60% 75%)',
        palette: {
          accent: 'hsl(160 60% 75%)',
          bg:     'rgba(179, 229, 212, 0.15)',
          border: 'rgba(179, 229, 212, 0.3)',
          label:  '#2D2D3D',
        },
      },
    ],
  },
] as const;
