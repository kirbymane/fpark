import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");

  if (!status) {
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );
  }

  const code = params.get("code");

  if (!code) {
    return NextResponse.json({ message: "No Code Provided" }, { status: 400 });
  }

  const token = await exchangeCodeForAccessToken(code as string);

  if (!token) {
    return NextResponse.json(
      { message: "Failed token exchange" },
      { status: 400 },
    );
  }

  const accountDetails = await getAccountDetails(token.accessToken);

  await db.account.upsert({
    where: { id: token.accountId.toString() },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });

  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId,
        userId,
      })
      .then((response) => {
        console.log("Initial sync triggered", response.data);
      })
      .catch((error) => {
        console.log("Failed to trigger initial sync", error);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
