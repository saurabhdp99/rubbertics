import React from 'react';
import { useERPStore } from '../store/erpStore';
import StatsCard from './common/StatsCard';
import {
  Package,
  Truck,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

const STAT_CONFIGS = [
  {
    key: 'total',
    label: 'Total Orders',
    icon: Package,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    key: 'dispatched',
    label: 'Dispatched',
    icon: CheckCircle2,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    key: 'partial',
    label: 'Partial Dispatch',
    icon: Truck,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
  },
  {
    key: 'urgent',
    label: 'High Priority',
    icon: AlertTriangle,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
  },
  {
    key: 'totalOrderQty',
    label: 'Total Order Qty',
    icon: TrendingUp,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.25)',
  },
];

export default function StatsBar() {
  const getStats = useERPStore(s => s.getStats);
  const stats = getStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {STAT_CONFIGS.map((cfg, index) => {
        const value = stats[cfg.key];
        return (
          <StatsCard
            key={cfg.key}
            label={cfg.label}
            value={value.toLocaleString()}
            icon={cfg.icon}
            color={cfg.color}
            bg={cfg.bg}
            border={cfg.border}
            animationDelay={index * 50}
          />
        );
      })}
    </div>
  );
}
