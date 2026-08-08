import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error signing out:", error);
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
