import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    message: "Detention billing API coming soon" 
  }, { status: 200 });
}