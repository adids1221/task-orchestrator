import { NextResponse } from "next/server";
import { authClient } from "@/lib/server/grpc-clients";
import { mapGrpcRegisterErrorToHttp, parseRegisterBody } from "@/lib/auth-utils";
import type { AuthResponse } from "../../../../../../packages/generated/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseRegisterBody(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const authResponse = await new Promise<AuthResponse>((resolve, reject) => {
      authClient.register(parsed.value, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });

    const res = NextResponse.json(
      {
        user: {
          id: authResponse.userId,
          email: authResponse.email,
          name: authResponse.name,
        },
      },
      { status: 201 },
    );

    res.cookies.set("auth_token", authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: unknown) {
    const mapped = mapGrpcRegisterErrorToHttp(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
