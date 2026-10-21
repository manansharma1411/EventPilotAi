/**
 * EventPilot AI - Gemini AI Client Architecture Stub
 * Complete AI generation schemas & validation will be activated in Phase 3.
 */

export interface GeminiConfig {
  hasApiKey: boolean;
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY;
  return {
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
  };
}
