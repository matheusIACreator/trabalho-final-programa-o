import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Paths with locale prefix
    "/(pt|en)/:path*",
    // Root — needed to detect + redirect to correct locale
    "/",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
}
