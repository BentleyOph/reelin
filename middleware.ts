import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow access to media files
  if (request.nextUrl.pathname.startsWith('/api/media/')) {
    return NextResponse.next();
  }

  // Your other middleware logic here...
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    // Add other paths that need middleware
  ],
}
