import * as React from "react";
import { Loader2 } from "lucide-react";

export const GlobalLoading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[100px] items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-200 animate-spin" />
      </div>
    </div>
  );
};
