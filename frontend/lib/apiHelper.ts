/**
 * Centralized API Fetch Helper for NexLapTech.
 * Guarantees that fetch responses are handled safely without crashing on non-JSON/HTML payloads.
 * Fulfills Task 2: Inspect every fetch, print status, headers, body if response.ok == false, read response.text() first.
 */

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
  isHtml: boolean;
  rawText: string;
}

export async function safeJsonFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Accept": "application/json",
        ...(options?.headers || {}),
      },
    });

    const status = response.status;
    const rawText = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html") || rawText.trim().startsWith("<");

    // Print details if response.ok is false or response is HTML (Task 2 Requirement)
    if (!response.ok || isHtml) {
      console.warn(`[SafeFetch Warning] URL: ${url} | Status: ${status}`);
      console.warn(`[SafeFetch Content-Type]: ${contentType}`);
      console.warn(`[SafeFetch Body Snippet]:`, rawText.substring(0, 300));
    }

    let parsedData: any = null;
    let parseError = "";

    try {
      if (rawText.trim()) {
        parsedData = JSON.parse(rawText);
      }
    } catch (err: any) {
      parseError = err.message;
    }

    if (response.ok && !isHtml && parsedData !== null) {
      return {
        ok: true,
        status,
        data: parsedData,
        error: "",
        isHtml: false,
        rawText,
      };
    }

    // Handle failure case safely
    let errorMessage = "";
    if (parsedData && typeof parsedData === "object") {
      errorMessage = parsedData.error || parsedData.message || parsedData.detail || `Server returned error (${status})`;
    } else if (isHtml) {
      errorMessage = `Server returned HTML page (${status}). Please check API endpoint route.`;
    } else if (parseError) {
      errorMessage = `Invalid JSON response from server (${status}).`;
    } else {
      errorMessage = `Request failed with status ${status}`;
    }

    return {
      ok: false,
      status,
      data: parsedData,
      error: errorMessage,
      isHtml,
      rawText,
    };
  } catch (err: any) {
    console.error(`[SafeFetch Network Error] URL: ${url}`, err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || "Network error. Please check your internet connection.",
      isHtml: false,
      rawText: "",
    };
  }
}
