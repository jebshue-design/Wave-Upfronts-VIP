import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/admin/login"];
const STATIC_PREFIXES = ["/_next/", "/fonts/", "/assets/", "/thumbnails/", "/headshots/", "/favicon.ico"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin section — requires separate admin cookie
  if (pathname.startsWith("/admin")) {
    const isAdminAuthed = request.cookies.has("wave-admin");
    if (!isAdminAuthed) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthed = request.cookies.has("wave-auth");

  if (!isAuthed && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
