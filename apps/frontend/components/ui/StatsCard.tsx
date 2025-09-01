'use client';

interface StatsCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  percentage?: number;
  value?: string;
  maxValue?: string;
  remaining?: string;
  showProgress?: boolean;
  iconBgColor?: string;
  iconTextColor?: string;
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'progress-error';
  if (percentage >= 70) return 'progress-warning';
  return 'progress-primary';
};

const getTextColor = (percentage: number) => {
  if (percentage >= 90) return 'text-error';
  if (percentage >= 70) return 'text-warning';
  return 'text-primary';
};

export default function StatsCard({
  title,
  subtitle,
  icon,
  percentage = 0,
  value,
  maxValue,
  remaining,
  showProgress = false,
  iconBgColor = 'bg-primary/10',
  iconTextColor = 'text-primary'
}: StatsCardProps) {
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <div className={`w-5 h-5 ${iconTextColor}`}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-base-content">{title}</h3>
          <p className="text-sm text-base-content/60">{subtitle}</p>
        </div>
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <progress 
            className={`progress w-full ${getProgressColor(percentage)}`} 
            value={percentage} 
            max="100"
          ></progress>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/60">{percentage}% used</span>
            <span className={`font-medium ${getTextColor(percentage)}`}>
              {remaining}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}