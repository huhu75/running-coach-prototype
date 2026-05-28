import { NextResponse } from "next/server";
import { generateTrainingPlan } from "@/lib/mistral/client";
import { UserProfile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const profile: UserProfile = await request.json();
    const plan = await generateTrainingPlan(profile);
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}
