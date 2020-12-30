/**
 * Reverse proxy.
 * @packageDocumentation
 */

import fetch from "node-fetch";
import { Response } from "express";

/**
 * Valid HTTP methods.
 */
type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

/**
 * Respond via proxy.
 *
 * @param res Response object.
 * @param url URL to fetch from.
 * @param method HTTP method to use.
 */
export default async function proxy(
  res: Response,
  url: string,
  method: HttpMethod = "GET"
): Promise<void> {
  const proxyRes = await fetch(url, { method });
  proxyRes.body.pipe(res);
}
