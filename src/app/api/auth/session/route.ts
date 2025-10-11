import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get("nocage-auth")?.value;

    if (!authToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Validate token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
    const validateResponse = await fetch(`${authServiceUrl}/api/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: authToken }),
    });

    if (!validateResponse.ok) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const data = await validateResponse.json();
    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
