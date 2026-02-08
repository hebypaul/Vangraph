import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/atomic/feedback/Skeleton";

interface StatsCardProps {
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  loading, 
  trend,
  className,
  children 
}: StatsCardProps) {
  return (
    <div className={cn("vg-card flex items-start gap-4", className)}>
      <div className="w-12 h-12 rounded-xl bg-vg-primary/10 flex items-center justify-center text-vg-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className="flex items-center justify-between">
            {children ? children : (
              <p className="text-2xl font-bold text-foreground">
                {value}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive 
                  ? "text-emerald-500 bg-emerald-500/10" 
                  : "text-rose-500 bg-rose-500/10"
              )}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.value}%
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
