import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  try {
    // This is a stub endpoint for NextAuth logging
    // You can implement logging here if needed
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
