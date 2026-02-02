'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  steps: Array<{ key: string; label: string }>;
  currentStepKey: string;
  completedSteps: string[];
  onStepClick?: (stepKey: string) => void;
}

export function WizardStepper({ steps, currentStepKey, completedSteps, onStepClick }: WizardStepperProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStepKey);

  return (
    <div className="bg-card border-b border-border overflow-x-auto">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-2">{steps.map((step, index) => {
        const isActive = step.key === currentStepKey;
        const isCompleted = completedSteps.includes(step.key);
        const isClickable = isCompleted || index <= currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => isClickable && onStepClick?.(step.key)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground',
                isClickable && !isActive && 'cursor-pointer hover:opacity-80'
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
            </button>
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-border mx-2 flex-shrink-0" />
            )}
          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
}
