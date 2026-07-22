import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ message, onRetry, className = "" }: ErrorStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
      <h3 className="mb-2 text-lg font-semibold text-red-600">{message}</h3>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
