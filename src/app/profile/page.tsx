import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Award, Flame, CheckCircle2 } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          User Profile
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Manage your personal developer account details, active badges, and streak milestones.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-sky-50 border-2 border-sky-100 flex items-center justify-center font-bold text-sky-600 text-3xl select-none">
              JD
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">John Doe</h2>
              <p className="text-sm text-slate-400">Software Engineer</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Badge variant="primary">Level 4</Badge>
              <Badge variant="success">Pro</Badge>
            </div>
            <div className="w-full h-px bg-slate-100" />
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                <p className="text-xs font-semibold text-slate-700 truncate">john.doe@example.com</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</span>
                <p className="text-xs font-semibold text-slate-700">June 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestone stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
                  <p className="text-2xl font-black text-slate-900">12 Days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">XP Earned</span>
                  <p className="text-2xl font-black text-slate-900">2,450 XP</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solved</span>
                  <p className="text-2xl font-black text-slate-900">48 Tasks</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Unlocked Badges</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <Award className="w-8 h-8 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">Recursion Hero</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <Flame className="w-8 h-8 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">10 Day Hotstreak</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center opacity-40">
                <Award className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-bold text-slate-800">DP Master</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center opacity-40">
                <Award className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-bold text-slate-800">Graph Lord</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
