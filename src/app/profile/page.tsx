"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSingleSelect, SearchableMultiSelect } from "@/components/ui/MultiSelect";
import { useAppContext, HistoryItem, RecommendationConfig, RecommendationPlatformConfig } from "@/context/AppContext";
import { Platform } from "@/services/types";
import { languagesList, dsaTopicsList } from "@/constants/topics";
import { checkRecommendationSettingsCooldown } from "@/services/cooldownService";
import { Award, Code2, BookOpen, Layers, Database, Download, Upload, RefreshCw, Settings, Info, Clock, Plus, Trash2 } from "lucide-react";

const AVAILABLE_PLATFORMS: { id: Platform; name: string }[] = [
  { id: "leetcode", name: "LeetCode" },
  { id: "codeforces", name: "Codeforces" }
];

interface ProfileFormProps {
  selectedLanguage: string;
  selectedTopics: string[];
  saveProfile: (lang: string, topics: string[]) => void;
  resetProfile: () => void;
  importProfile: (lang: string, topics: string[], history: HistoryItem[]) => void;
  history: HistoryItem[];
  updateRecommendationConfig: (platformConfigs: RecommendationPlatformConfig[]) => { success: boolean; message: string };
  recommendationConfig: RecommendationConfig;
}

function ProfileForm({
  selectedLanguage,
  selectedTopics,
  saveProfile,
  resetProfile,
  importProfile,
  history,
  updateRecommendationConfig,
  recommendationConfig
}: ProfileFormProps) {
  const [localLanguage, setLocalLanguage] = React.useState<string>(selectedLanguage);
  const [localTopics, setLocalTopics] = React.useState<string[]>(selectedTopics);
  const [localPlatformConfigs, setLocalPlatformConfigs] = React.useState<RecommendationPlatformConfig[]>(
    recommendationConfig.platformConfigs || []
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cooldownStatus = checkRecommendationSettingsCooldown(recommendationConfig.lastRecommendationSettingsUpdate);

  const handleSave = () => {
    saveProfile(localLanguage, localTopics);
  };

  const handleCancel = () => {
    setLocalLanguage(selectedLanguage);
    setLocalTopics(selectedTopics);
    setLocalPlatformConfigs(recommendationConfig.platformConfigs || []);
  };

  const handleExport = () => {
    const exportData = {
      version: 1,
      language: selectedLanguage,
      topics: selectedTopics,
      history: history
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dsa_profile.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target!.result as string);

        if (json.version !== 1) {
          alert("Incompatible profile version. Only version 1 profiles are supported.");
          return;
        }

        if (typeof json.language !== "string" || !Array.isArray(json.topics)) {
          alert("Invalid profile schema file format.");
          return;
        }

        if (!languagesList.includes(json.language)) {
          alert(`Invalid programming language in profile: ${json.language}`);
          return;
        }

        const validTopics = json.topics.filter((t: unknown): t is string => typeof t === "string" && dsaTopicsList.includes(t));

        importProfile(json.language, validTopics, json.history || []);
      } catch {
        alert("Error parsing profile JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleReset = () => {
    if (window.confirm("Reset your permanent knowledge profile?")) {
      resetProfile();
    }
  };

  const handleSaveConfig = () => {
    updateRecommendationConfig(localPlatformConfigs);
  };

  const handleUpdateCard = (index: number, field: keyof RecommendationPlatformConfig, value: unknown) => {
    setLocalPlatformConfigs(prev => {
      const next = [...prev];
      if (!next[index]) return prev;

      if (field === "questionsPerDay") {
        const numVal = Math.max(1, Math.min(10, parseInt(value as string) || 1));
        next[index] = { ...next[index], questionsPerDay: numVal };
      } else if (field === "platform") {
        next[index] = { ...next[index], platform: value as Platform };
      } else if (field === "difficulty") {
        next[index] = { ...next[index], difficulty: value as RecommendationPlatformConfig["difficulty"] };
      }

      return next;
    });
  };

  const handleAddPlatform = () => {
    if (localPlatformConfigs.length >= AVAILABLE_PLATFORMS.length) return;

    // Find the first platform not currently added
    const usedPlatforms = localPlatformConfigs.map(c => c.platform);
    const available = AVAILABLE_PLATFORMS.find(p => !usedPlatforms.includes(p.id));

    if (available) {
      setLocalPlatformConfigs(prev => [
        ...prev,
        {
          platform: available.id,
          questionsPerDay: 5,
          difficulty: "Mixed"
        }
      ]);
    }
  };

  const handleRemovePlatform = (index: number) => {
    if (localPlatformConfigs.length <= 1) return;
    setLocalPlatformConfigs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Permanent Knowledge Profile
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-3xl leading-relaxed">
          Choose every DSA topic you already know. These topics will become your permanent knowledge base and will later be used by AI to recommend suitable problems.
        </p>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Form Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                  <Code2 className="w-4.5 h-4.5" />
                </div>
                <CardTitle className="text-base">Section 1: Programming Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Select the main programming language you use for solving algorithms. Only one language can be active.
              </p>
              <div className="max-w-md">
                <SearchableSingleSelect
                  options={languagesList}
                  selected={localLanguage}
                  onChange={setLocalLanguage}
                  placeholder="Choose programming language..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <CardTitle className="text-base">Section 2: Known Topics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Select all data structures and algorithms concepts you have already mastered. Search topics below to add them to your profile.
              </p>
              <SearchableMultiSelect
                options={dsaTopicsList}
                selected={localTopics}
                onChange={setLocalTopics}
                placeholder="Search and select DSA topics..."
              />
            </CardContent>
          </Card>

          {/* Section 3: Recommendation Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <CardTitle className="text-base">Section 3: Recommendation Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Information Notice Card */}
              <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-sky-800 text-sm">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Recommendation Rules</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium leading-relaxed pl-0.5">
                  <li>Maximum 10 questions per platform can be selected.</li>
                  <li>Recommendation settings can only be changed once every 24 hours.</li>
                  <li>Language and Known Topics can still be edited at any time.</li>
                  <li>Additional platforms can be supported in future updates.</li>
                </ul>
              </div>

              {/* Cooldown Status Warning Banner */}
              {!cooldownStatus.canUpdate && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-amber-800 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-900">Recommendation Settings Locked (24-Hour Cooldown)</p>
                    <p className="text-amber-700 leading-relaxed">
                      Settings were recently updated. Next update available in <span className="font-bold text-amber-900">{cooldownStatus.formattedRemainingTime}</span> (at {cooldownStatus.nextAvailableTimeFormatted}). Language and Known Topics remain fully editable.
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Configuration Cards */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Platform Configurations ({localPlatformConfigs.length})
                  </span>
                </div>

                {localPlatformConfigs.map((cfg, index) => {
                  return (
                    <div
                      key={index}
                      className="border border-slate-200/80 bg-white rounded-2xl p-4 space-y-4 transition-all hover:border-slate-300"
                    >
                      {/* Card Top Row */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Platform #{index + 1}
                        </span>

                        {/* Remove button: rendered only if more than 1 platform exists */}
                        {localPlatformConfigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePlatform(index)}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Remove platform configuration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Card Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Platform Dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Platform</label>
                          <select
                            value={cfg.platform}
                            onChange={(e) => handleUpdateCard(index, "platform", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50 font-medium text-slate-700"
                          >
                            {AVAILABLE_PLATFORMS.map(p => {
                              const isUsedByOther = localPlatformConfigs.some((item, i) => i !== index && item.platform === p.id);
                              return (
                                <option key={p.id} value={p.id} disabled={isUsedByOther}>
                                  {p.name} {isUsedByOther ? "(Already added)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Questions Per Day */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">
                            Daily Questions <span className="text-slate-400 font-normal">(1 - 10)</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={cfg.questionsPerDay}
                            onChange={(e) => handleUpdateCard(index, "questionsPerDay", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50 font-medium text-slate-700"
                          />
                        </div>

                        {/* Difficulty Dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Difficulty</label>
                          <select
                            value={cfg.difficulty}
                            onChange={(e) => handleUpdateCard(index, "difficulty", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50 font-medium text-slate-700"
                          >
                            <option value="Mixed">Mixed (All Levels)</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Platform Button: hidden when all available platforms are added */}
                {localPlatformConfigs.length < AVAILABLE_PLATFORMS.length && (
                  <button
                    type="button"
                    onClick={handleAddPlatform}
                    className="w-full py-2.5 px-4 border border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 text-sky-700 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Platform</span>
                  </button>
                )}
              </div>

            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveConfig}
                  className="cursor-pointer font-medium"
                >
                  Save Recommendation Settings
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Section 4: Cancel and Save Profile buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="md" className="cursor-pointer" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" size="md" className="cursor-pointer" onClick={handleSave}>
                Save Profile
              </Button>
            </div>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              Changes will update your personalized difficulty curve.
            </span>
          </div>
        </div>

        {/* Right Stats Column (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Section 3: Stat Card */}
          <Card className="border-sky-100 bg-sky-50/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-sky-500/5 blur-xl" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Dashboard Metric</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-500">Total Topics Selected</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {localTopics.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    / {dsaTopicsList.length} topics
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(localTopics.length / dsaTopicsList.length) * 100}%` }}
                />
              </div>

              <div className="pt-2 text-xs text-slate-500 font-medium leading-relaxed">
                Your permanent knowledge represents <span className="font-bold text-sky-700">{Math.round((localTopics.length / dsaTopicsList.length) * 100)}%</span> of the standard DSA curriculum.
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                  <Award className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm">Knowledge Base Tip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 leading-relaxed">
                By marking a topic as known, the AI coach assumes you understand its foundational properties and will skip beginner-level problems.
              </p>
            </CardContent>
          </Card>

          {/* Data Management Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                  <Database className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm">Data Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-450 font-semibold leading-relaxed">
                Backup or restore your permanent knowledge profile configuration.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={handleExport} className="w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Export Profile
                </Button>
                
                <Button variant="secondary" size="sm" onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Import Profile
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json"
                  className="hidden"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function Profile() {
  const { selectedLanguage, selectedTopics, saveProfile, resetProfile, importProfile, history, updateRecommendationConfig, recommendationConfig } = useAppContext();

  return (
    <ProfileForm
      key={`${selectedLanguage}-${selectedTopics.join(",")}-${JSON.stringify(recommendationConfig)}`}
      selectedLanguage={selectedLanguage}
      selectedTopics={selectedTopics}
      saveProfile={saveProfile}
      resetProfile={resetProfile}
      importProfile={importProfile}
      history={history}
      updateRecommendationConfig={updateRecommendationConfig}
      recommendationConfig={recommendationConfig}
    />
  );
}
