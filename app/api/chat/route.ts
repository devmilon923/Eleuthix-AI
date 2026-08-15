import { NextResponse } from "next/server";

// Helper: Fetch authorized client origin from process.env.CLIENT_URL or default domain
function getAllowedOrigins(): string[] {
  const envUrl = process.env.CLIENT_URL;
  const origins = [
    "https://eleuthixai.vercel.app",
    "https://eleuthix-ai.vercel.app",
  ];

  if (envUrl) {
    try {
      const formatted = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
      const parsed = new URL(formatted);
      const parsedOrigin = parsed.origin.toLowerCase();
      if (!origins.includes(parsedOrigin)) {
        origins.push(parsedOrigin);
      }
    } catch {
      // Ignore malformed URL
    }
  }

  return origins;
}

// Strict Security Helper: Validate requesting client Origin, Referer, and Host
function isOriginAllowed(req: Request): {
  allowed: boolean;
  origin: string | null;
} {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  const allowedOrigins = getAllowedOrigins();

  // Strict check Origin header
  if (origin && allowedOrigins.includes(origin.toLowerCase())) {
    return { allowed: true, origin };
  }

  // Strict check Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin.toLowerCase();
      if (allowedOrigins.includes(refererOrigin)) {
        return { allowed: true, origin: refererOrigin };
      }
    } catch {
      // Ignore invalid URL
    }
  }

  // Strict check Host header
  if (host) {
    const hostWithProtocol = `https://${host}`.toLowerCase();
    const isHostAllowed = allowedOrigins.some(
      (allowed) =>
        allowed.includes(host.toLowerCase()) || hostWithProtocol.includes(allowed),
    );
    if (isHostAllowed) {
      return { allowed: true, origin: origin || `https://${host}` };
    }
  }

  return { allowed: false, origin: null };
}

// CORS Headers builder
function getCorsHeaders(origin: string | null) {
  const defaultClientUrl =
    process.env.CLIENT_URL || "https://eleuthixai.vercel.app";

  return {
    "Access-Control-Allow-Origin": origin || defaultClientUrl,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: Request) {
  const { allowed, origin } = isOriginAllowed(req);
  if (!allowed) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: Request) {
  // Strict security origin check
  const { allowed, origin } = isOriginAllowed(req);

  if (!allowed) {
    return NextResponse.json(
      { error: "Access denied: Request origin is not authorized." },
      {
        status: 403,
        headers: getCorsHeaders(null),
      },
    );
  }

  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { error: "Server configuration error: Missing API URL" },
        { status: 500, headers: corsHeaders },
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Request failed (${response.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`,
        },
        { status: response.status, headers: corsHeaders },
      );
    }

    const answer =
      typeof data === "object" && data !== null
        ? (data.response ??
          data.message ??
          data.content ??
          data.answer ??
          JSON.stringify(data))
        : String(data);

    return NextResponse.json(
      {
        status: "success",
        response: answer,
        developer: "dev.milon923@gmail.com",
        service: "Eleuthix AI Core",
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
