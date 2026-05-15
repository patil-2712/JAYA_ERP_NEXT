import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    message: "Other billing API coming soon" 
  }, { status: 200 });
}