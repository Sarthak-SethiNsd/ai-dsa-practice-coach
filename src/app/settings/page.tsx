import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sliders, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          App Settings
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Configure app preferences, notification triggers, theme settings, and security keys.
        </p>
      </div>

      {/* Settings Options Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Preferences */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Sliders className="w-5 h-5" />
              </div>
              <CardTitle>Coach Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between pb-1">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-800">Difficulty Focus</span>
                  <span className="text-xs text-slate-400">Target problems around your current level.</span>
                </div>
                <span className="text-xs font-bold text-sky-600">Medium</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-800">Primary Language</span>
                  <span className="text-xs text-slate-400">Coding language for recommended boilerplate.</span>
                </div>
                <span className="text-xs font-bold text-sky-600">TypeScript</span>
              </div>
            </CardContent>
          </div>
          <CardFooter>
            <Button variant="secondary" size="sm" className="w-full font-semibold" disabled>
              Edit Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Notifications */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Bell className="w-5 h-5" />
              </div>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between pb-1">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-800">Daily Practice Reminder</span>
                  <span className="text-xs text-slate-400">Receive alerts to preserve your daily hotstreak.</span>
                </div>
                <span className="text-xs font-bold text-indigo-600">Enabled</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-800">Review Feedback Alerts</span>
                  <span className="text-xs text-slate-400">Get notified when AI evaluations are complete.</span>
                </div>
                <span className="text-xs font-bold text-indigo-600">Enabled</span>
              </div>
            </CardContent>
          </div>
          <CardFooter>
            <Button variant="secondary" size="sm" className="w-full font-semibold" disabled>
              Configure Reminders
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
