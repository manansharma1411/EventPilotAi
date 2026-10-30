// ==============================================================================
// EventPilot AI - Gemini API Client (Server-side Only)
// Direct HTTP execution against official Google Gemini 2.5 Flash endpoint
// Zero external SDK dependencies, bounded timeouts, and strict security
// ==============================================================================

const GEMINI_API_VERSION = "v1beta";
const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 30000; // 30-second bounded timeout

export interface GeminiRequestOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

export class GeminiServiceError extends Error {
  public statusCode?: number;
  public isTimeout?: boolean;
  public isRateLimited?: boolean;

  constructor(message: string, options?: { statusCode?: number; isTimeout?: boolean; isRateLimited?: boolean }) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = options?.statusCode;
    this.isTimeout = options?.isTimeout;
    this.isRateLimited = options?.isRateLimited;
  }
}

/**
 * Checks if GEMINI_API_KEY is configured on the server
 */
export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 5);
}

/**
 * Executes a structured generation call to the Gemini API
 */
export async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new GeminiServiceError(
      "Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment (.env.local).",
      { statusCode: 503 }
    );
  }

  const model = options.model || GEMINI_DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || REQUEST_TIMEOUT_MS;

  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: options.temperature ?? 0.2, // Low temperature for deterministic structured JSON
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      responseMimeType: "application/json",
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let parsedError: Record<string, unknown> = {};
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        // Raw text
      }

      const errorMessage =
        (parsedError.error as Record<string, string>)?.message ||
        `Gemini API returned status ${response.status}`;

      if (response.status === 429) {
        throw new GeminiServiceError("Rate limit reached on Gemini API. Please wait a moment before retrying.", {
          statusCode: 429,
          isRateLimited: true,
        });
      }

      throw new GeminiServiceError(`Gemini generation failed: ${errorMessage}`, {
        statusCode: response.status,
      });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new GeminiServiceError("Model returned an empty response. Please retry.");
    }

    return candidate.content.parts[0].text;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof GeminiServiceError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new GeminiServiceError("Gemini generation timed out after 30 seconds. Please retry.", {
        isTimeout: true,
      });
    }

    const msg = err instanceof Error ? err.message : "Unknown error during AI generation";
    throw new GeminiServiceError(`Network error communicating with AI provider: ${msg}`);
  }
}
