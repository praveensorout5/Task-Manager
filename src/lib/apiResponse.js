import { NextResponse } from 'next/server';

/**
 * Standard API response helper
 */
export function apiResponse(data, message = 'Success', status = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

/**
 * Standard API error response helper
 */
export function apiError(message = 'Internal Server Error', status = 500) {
  return NextResponse.json(
    { success: false, message, data: null },
    { status }
  );
}
