"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchableSingleSelect, SearchableMultiSelect } from "@/components/ui/MultiSelect";
import { useAppContext, HistoryItem } from "@/context/AppContext";
import { Award, Code2, BookOpen, Layers, Database, Download, Upload, RefreshCw } from "lucide-react";

const languagesList = ["Java", "C++", "Python", "JavaScript", "C#", "Go", "Rust"];

const dsaTopicsList = [
  "Arrays",
  "Strings",
  "Sorting",
  "Searching",
  "Binary Search",
  "Recursion",
  "Backtracking",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Hashing",
  "Stack",
  "Queue",
  "Deque",
  "Linked List",
  "Doubly Linked List",
  "Circular Linked List",
  "Trees",
  "Binary Trees",
  "BST",
  "Heap",
  "Priority Queue",
  "Trie",
  "Graph",
  "DFS",
  "BFS",
  "Union Find",
  "Topological Sort",
  "Shortest Path",
  "Greedy",
  "Bit Manipulation",
  "Math",
  "Number Theory",
  "Matrix",
  "Dynamic Programming",
  "Intervals",
  "Monotonic Stack",
  "Monotonic Queue",
  "Segment Tree",
  "Fenwick Tree",
  "Disjoint Set"
];

interface ProfileFormProps {
  selectedLanguage: string;
  selectedTopics: string[];
  saveProfile: (lang: string, topics: string[]) => void;
  resetProfile: () => void;
  importProfile: (lang: string, topics: string[], history: HistoryItem[]) => void;
  history: HistoryItem[];
}

function ProfileForm({
  selectedLanguage,
  selectedTopics,
  saveProfile,
  resetProfile,
  importProfile,
  history
}: ProfileFormProps) {
  const [localLanguage, setLocalLanguage] = React.useState<string>(selectedLanguage);
  const [localTopics, setLocalTopics] = React.useState<string[]>(selectedTopics);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveProfile(localLanguage, localTopics);
  };

  const handleCancel = () => {
    setLocalLanguage(selectedLanguage);
    setLocalTopics(selectedTopics);
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

        // Versioning validation
        if (json.version !== 1) {
          alert("Incompatible profile version. Only version 1 profiles are supported.");
          return;
        }

        // Schema validation
        if (typeof json.language !== "string" || !Array.isArray(json.topics)) {
          alert("Invalid profile schema file format.");
          return;
        }

        // Validate that language is one of the supported languages
        if (!languagesList.includes(json.language)) {
          alert(`Invalid programming language in profile: ${json.language}`);
          return;
        }

        // Validate that topics are part of dsaTopicsList
        const validTopics = json.topics.filter((t: unknown): t is string => typeof t === "string" && dsaTopicsList.includes(t));

        importProfile(json.language, validTopics, json.history || []);
      } catch {
        alert("Error parsing profile JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be uploaded again
    event.target.value = "";
  };

  const handleReset = () => {
    if (window.confirm("Reset your permanent knowledge profile?")) {
      resetProfile();
    }
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
  const { selectedLanguage, selectedTopics, saveProfile, resetProfile, importProfile, history } = useAppContext();

  return (
    <ProfileForm
      key={`${selectedLanguage}-${selectedTopics.join(",")}`}
      selectedLanguage={selectedLanguage}
      selectedTopics={selectedTopics}
      saveProfile={saveProfile}
      resetProfile={resetProfile}
      importProfile={importProfile}
      history={history}
    />
  );
}
