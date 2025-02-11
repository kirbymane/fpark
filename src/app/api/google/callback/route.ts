import { NextResponse, type NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const testUrl = "https://api.aurinko.io/v1/auth/callback";
  const redirectUrl = new URL(testUrl);

  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(redirectUrl.toString(), 302);
};
