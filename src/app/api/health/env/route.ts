import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/env";
import {
  getSupabasePublicKey,
  getSupabasePublicUrl,
  hasSupabasePublicEnv,
} from "@/utils/supabase/env";

export const dynamic = "force-dynamic";

/** Diagnóstico seguro (sin secretos). */
export async function GET() {
  const supabaseUrl = getSupabasePublicUrl();
  const app = getAppUrl();
  let supabaseUrlOk = false;
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl);
      supabaseUrlOk =
        /\.supabase\.co$/i.test(u.hostname) &&
        u.pathname === "/" &&
        u.protocol === "https:";
    } catch {
      supabaseUrlOk = false;
    }
  }

  const supabaseRef = supabaseUrl
    ? new URL(supabaseUrl).hostname.split(".")[0]
    : null;

  return NextResponse.json({
    hasSupabasePublicEnv: hasSupabasePublicEnv(),
    supabaseProjectRef: supabaseRef,
    supabaseUrlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    supabaseUrlOk,
    hasPublishableKey: Boolean(getSupabasePublicKey()),
    appUrl: app.value,
    appUrlIsSupabaseHost: app.isSupabaseProjectHost,
    nodeEnv: process.env.NODE_ENV,
  });
}
