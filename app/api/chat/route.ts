import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { error: "Server configuration error: Missing API URL" },
        { status: 500 },
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
        { status: response.status },
      );
    }

    const answer =
      typeof data === "object" && data !== null
        ? data.response ?? data.message ?? data.content ?? data.answer ?? JSON.stringify(data)
        : String(data);

    return NextResponse.json({
      status: "success",
      response: answer,
      developer: "dev.milon923@gmail.com",
      service: "Eleuthix AI Core",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
