import * as React from "react";
import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex h-[100px] items-center justify-center">
      <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
    </div>
  );
};
