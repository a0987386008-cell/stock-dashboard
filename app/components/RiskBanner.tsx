// app/components/RiskBanner.tsx
import React from 'react';

interface RiskBannerProps {
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export default function RiskBanner({ level, title, description }: RiskBannerProps) {
  const styles = {
    high: {
      border: 'border-red-500',
      bg: 'bg-red-50/80 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-400',
      subText: 'text-red-600/80 dark:text-red-300/80',
      badgeBg: 'bg-red-500',
      pingBg: 'bg-red-400',
      icon: '🔴',
    },
    medium: {
      border: 'border-amber-500',
      bg: 'bg-amber-50/80 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      subText: 'text-amber-600/80 dark:text-amber-300/80',
      badgeBg: 'bg-amber-500',
      pingBg: 'bg-amber-400',
      icon: '🟡',
    },
    low: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      subText: 'text-emerald-600/80 dark:text-emerald-300/80',
      badgeBg: 'bg-emerald-500',
      pingBg: 'bg-emerald-400',
      icon: '🟢',
    },
  }[level];

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 ${styles.border} ${styles.bg} p-5 shadow-lg transition-all`}>
      {/* 呼吸燈脈動特效 */}
      <div className="absolute top-4 right-4 flex h-3 w-3">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${styles.pingBg} opacity-75`}></span>
        <span className={`relative inline-flex h-3 w-3 rounded-full ${styles.badgeBg}`}></span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-2xl">{styles.icon}</span>
        <div>
          <h3 className={`text-lg font-bold ${styles.text}`}>{title}</h3>
          <p className={`text-sm ${styles.subText}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}