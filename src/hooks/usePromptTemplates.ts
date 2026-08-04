"use client";

import * as React from "react";
import { PromptTemplate, CreatePromptTemplatePayload, UpdatePromptTemplatePayload } from "@/services/promptTemplateTypes";
import { promptTemplateStorage } from "@/services/promptTemplateStorage";

export interface UsePromptTemplatesReturn {
  templates: PromptTemplate[];
  builtinTemplates: PromptTemplate[];
  customTemplates: PromptTemplate[];
  defaultTemplate: PromptTemplate | null;
  loading: boolean;
  createTemplate: (payload: CreatePromptTemplatePayload) => Promise<PromptTemplate>;
  updateTemplate: (id: string, payload: UpdatePromptTemplatePayload) => Promise<PromptTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  duplicateTemplate: (id: string) => Promise<PromptTemplate | null>;
  setDefaultTemplate: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function usePromptTemplates(): UsePromptTemplatesReturn {
  const [templates, setTemplates] = React.useState<PromptTemplate[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

  const refresh = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await promptTemplateStorage.getAll();
        if (!cancelled) setTemplates(data);
      } catch (err) {
        console.error("[usePromptTemplates] Load failed:", err);
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  const builtinTemplates = React.useMemo(() => templates.filter((t) => t.isBuiltin), [templates]);
  const customTemplates = React.useMemo(() => templates.filter((t) => !t.isBuiltin), [templates]);
  const defaultTemplate = React.useMemo(() => templates.find((t) => t.isDefault) ?? builtinTemplates[0] ?? null, [templates, builtinTemplates]);

  const createTemplate = React.useCallback(async (payload: CreatePromptTemplatePayload) => {
    const created = await promptTemplateStorage.save(payload);
    refresh();
    return created;
  }, [refresh]);

  const updateTemplate = React.useCallback(async (id: string, payload: UpdatePromptTemplatePayload) => {
    const updated = await promptTemplateStorage.update(id, payload);
    refresh();
    return updated;
  }, [refresh]);

  const deleteTemplate = React.useCallback(async (id: string) => {
    const success = await promptTemplateStorage.deleteById(id);
    if (success) refresh();
    return success;
  }, [refresh]);

  const duplicateTemplate = React.useCallback(async (id: string) => {
    const dup = await promptTemplateStorage.duplicate(id);
    if (dup) refresh();
    return dup;
  }, [refresh]);

  const setDefaultTemplate = React.useCallback(async (id: string) => {
    const success = await promptTemplateStorage.setDefault(id);
    if (success) refresh();
    return success;
  }, [refresh]);

  return {
    templates,
    builtinTemplates,
    customTemplates,
    defaultTemplate,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate,
    refresh,
  };
}
