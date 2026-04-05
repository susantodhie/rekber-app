import type { Request } from "express";

/**
 * Safely extract a single param value from Express 5 params
 * Express 5 types req.params values as string | string[]
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0];
  return value as string;
}

/**
 * Safely extract a query string value
 */
export function getQuery(req: Request, name: string): string | undefined {
  const value = req.query[name];
  if (Array.isArray(value)) return value[0] as string;
  return value as string | undefined;
}

/**
 * Parse integer from query with a default value
 */
export function getQueryInt(req: Request, name: string, defaultVal: number): number {
  const raw = getQuery(req, name);
  if (!raw) return defaultVal;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}
