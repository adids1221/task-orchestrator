import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const json = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: payload.userId ?? payload.sub,
      email: payload.email,
      name: payload.name,
    },
  });
}
