import { PromptTemplate, CreatePromptTemplatePayload, UpdatePromptTemplatePayload } from "./promptTemplateTypes";
import { BUILTIN_PROMPT_TEMPLATES } from "./builtinPromptTemplates";

const STORAGE_KEY = "dsa_prompt_templates";
const DEFAULT_ID_STORAGE_KEY = "dsa_default_prompt_template_id";

export interface PromptTemplateStorageProvider {
  getAll(): Promise<PromptTemplate[]>;
  getById(id: string): Promise<PromptTemplate | null>;
  save(payload: CreatePromptTemplatePayload): Promise<PromptTemplate>;
  update(id: string, payload: UpdatePromptTemplatePayload): Promise<PromptTemplate | null>;
  deleteById(id: string): Promise<boolean>;
  duplicate(id: string): Promise<PromptTemplate | null>;
  setDefault(id: string): Promise<boolean>;
  getDefault(): Promise<PromptTemplate | null>;
}

export class LocalStoragePromptTemplateStorage implements PromptTemplateStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getCustomTemplates(): PromptTemplate[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[PromptTemplateStorage] Failed to parse custom templates:", e);
      return [];
    }
  }

  private saveCustomTemplates(templates: PromptTemplate[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }

  private getDefaultId(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(DEFAULT_ID_STORAGE_KEY);
  }

  private setDefaultId(id: string | null): void {
    if (!this.isClient()) return;
    if (id) {
      localStorage.setItem(DEFAULT_ID_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(DEFAULT_ID_STORAGE_KEY);
    }
  }

  async getAll(): Promise<PromptTemplate[]> {
    const custom = this.getCustomTemplates();
    const activeDefaultId = this.getDefaultId() ?? "builtin_general";

    // Merge built-in + custom templates
    const combined = [...BUILTIN_PROMPT_TEMPLATES, ...custom].map((tpl) => ({
      ...tpl,
      isDefault: tpl.id === activeDefaultId,
    }));

    return combined;
  }

  async getById(id: string): Promise<PromptTemplate | null> {
    const all = await this.getAll();
    return all.find((t) => t.id === id) ?? null;
  }

  async getDefault(): Promise<PromptTemplate | null> {
    const all = await this.getAll();
    return all.find((t) => t.isDefault) ?? all[0] ?? null;
  }

  async save(payload: CreatePromptTemplatePayload): Promise<PromptTemplate> {
    const now = new Date().toISOString();
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newTemplate: PromptTemplate = {
      id: newId,
      name: payload.name.trim(),
      description: payload.description.trim(),
      prompt: payload.prompt.trim(),
      isBuiltin: false,
      isDefault: Boolean(payload.isDefault),
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.getCustomTemplates();
    this.saveCustomTemplates([newTemplate, ...existing]);

    if (payload.isDefault) {
      this.setDefaultId(newId);
    }

    return newTemplate;
  }

  async update(id: string, payload: UpdatePromptTemplatePayload): Promise<PromptTemplate | null> {
    // Builtin templates are read-only
    const builtinMatch = BUILTIN_PROMPT_TEMPLATES.find((b) => b.id === id);
    if (builtinMatch) {
      console.warn("[PromptTemplateStorage] Built-in templates cannot be edited.");
      return null;
    }

    const existing = this.getCustomTemplates();
    const targetIndex = existing.findIndex((t) => t.id === id);
    if (targetIndex === -1) return null;

    const current = existing[targetIndex];
    const updated: PromptTemplate = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      description: payload.description !== undefined ? payload.description.trim() : current.description,
      prompt: payload.prompt !== undefined ? payload.prompt.trim() : current.prompt,
      updatedAt: new Date().toISOString(),
    };

    existing[targetIndex] = updated;
    this.saveCustomTemplates(existing);

    if (payload.isDefault !== undefined) {
      if (payload.isDefault) {
        this.setDefaultId(id);
      } else if (this.getDefaultId() === id) {
        this.setDefaultId("builtin_general");
      }
    }

    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    // Builtin templates cannot be deleted
    if (BUILTIN_PROMPT_TEMPLATES.some((b) => b.id === id)) {
      console.warn("[PromptTemplateStorage] Built-in templates cannot be deleted.");
      return false;
    }

    const existing = this.getCustomTemplates();
    const filtered = existing.filter((t) => t.id !== id);
    if (filtered.length === existing.length) return false;

    this.saveCustomTemplates(filtered);

    // Reset default to builtin_general if default was deleted
    if (this.getDefaultId() === id) {
      this.setDefaultId("builtin_general");
    }

    return true;
  }

  async duplicate(id: string): Promise<PromptTemplate | null> {
    const target = await this.getById(id);
    if (!target) return null;

    return this.save({
      name: `${target.name} (Copy)`,
      description: target.description,
      prompt: target.prompt,
      isDefault: false,
    });
  }

  async setDefault(id: string): Promise<boolean> {
    const target = await this.getById(id);
    if (!target) return false;

    this.setDefaultId(id);
    return true;
  }
}

export const promptTemplateStorage = new LocalStoragePromptTemplateStorage();
