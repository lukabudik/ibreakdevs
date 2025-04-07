import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@/types";

/**
 * Creates a standardized JSON error response.
 * @param message - The main error message.
 * @param status - The HTTP status code.
 * @param details - Optional additional error details (can be Error object, string, or other).
 * @returns A NextResponse object with the error payload.
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: string | Error | unknown
): NextResponse<ApiErrorResponse> {
  let detailString: string | undefined;
  if (details instanceof Error) {
    detailString = details.message;
  } else if (typeof details === "string") {
    detailString = details;
  } else if (details) {
    // Attempt to stringify other types, handle potential circular references?
    try {
      detailString = JSON.stringify(details);
    } catch {
      detailString = "Could not stringify error details.";
    }
  }

  // Log the error server-side for debugging
  console.error(
    `API Error (${status}): ${message}`,
    details instanceof Error ? details : detailString || ""
  );

  const errorResponse: ApiErrorResponse = { error: message };
  if (detailString) {
    errorResponse.details = detailString;
  }

  return NextResponse.json(errorResponse, { status });
}
