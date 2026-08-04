export interface PromptTemplate {
  /** Unique ID, e.g. 'builtin_general' or 'custom_1722518400000_abc123' */
  id: string;
  /** Display name of the template */
  name: string;
  /** Short description of purpose or focus */
  description: string;
  /** Full instruction prompt text injected into custom instructions */
  prompt: string;
  /** True for built-in read-only templates */
  isBuiltin: boolean;
  /** True if this template is auto-selected as default on page mount */
  isDefault: boolean;
  /** ISO timestamp string */
  createdAt: string;
  /** ISO timestamp string */
  updatedAt: string;
}

export interface CreatePromptTemplatePayload {
  name: string;
  description: string;
  prompt: string;
  isDefault?: boolean;
}

export interface UpdatePromptTemplatePayload {
  name?: string;
  description?: string;
  prompt?: string;
  isDefault?: boolean;
}
