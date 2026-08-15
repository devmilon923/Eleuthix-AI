import { NextResponse } from "next/server";

// Helper: Fetch authorized client origin directly from process.env.CLIENT_URL
function getAllowedOrigin(): string {
  const envUrl = process.env.CLIENT_URL as string;
  try {
    const formatted = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    const parsed = new URL(formatted);
    return parsed.origin.toLowerCase();
  } catch {
    return envUrl.toLowerCase();
  }
}

// Security Helper: Validate requesting client Origin, Referer, and Host against environment CLIENT_URL
function isOriginAllowed(req: Request): {
  allowed: boolean;
  origin: string;
} {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  const allowedOrigin = getAllowedOrigin();

  // Check Origin header
  if (origin && origin.toLowerCase() === allowedOrigin) {
    return { allowed: true, origin };
  }

  // Check Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.origin.toLowerCase() === allowedOrigin) {
        return { allowed: true, origin: refererUrl.origin };
      }
    } catch {
      // Ignore invalid URL
    }
  }

  // Same-origin Host header verification
  if (host) {
    const hostWithProtocol = `https://${host}`.toLowerCase();
    if (
      allowedOrigin.includes(host.toLowerCase()) ||
      hostWithProtocol === allowedOrigin
    ) {
      return { allowed: true, origin: origin || `https://${host}` };
    }
  }

  return { allowed: false, origin: allowedOrigin };
}

// CORS Headers builder
function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
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
  // Security origin check against environment CLIENT_URL
  const { allowed, origin } = isOriginAllowed(req);

  if (!allowed) {
    return NextResponse.json(
      { error: "Access denied: Request origin is not authorized." },
      {
        status: 403,
        headers: getCorsHeaders(origin),
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
