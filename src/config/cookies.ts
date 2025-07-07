import { ENVIRONMENT } from "./environment";

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  domain?: string;
  path: string;
}

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true, // Always use httpOnly for security
  secure: ENVIRONMENT === "production",
  sameSite: ENVIRONMENT === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
  path: "/",
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true, // Always use httpOnly for security
  secure: ENVIRONMENT === "production",
  sameSite: ENVIRONMENT === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
  path: "/",
});

export const getClearCookieOptions = (): Omit<CookieOptions, "maxAge"> => ({
  httpOnly: true,
  secure: ENVIRONMENT === "production",
  sameSite: ENVIRONMENT === "production" ? "none" : "lax",
  domain: ENVIRONMENT === "production" ? ".ekoru.cl" : undefined,
  path: "/",
});
