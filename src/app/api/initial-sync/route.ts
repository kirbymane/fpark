import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: "Missing accountId or requestId" },
      { status: 400 },
    );
  }

  const dbAccount = await db.account.findUnique({
    where: { id: accountId.toString(), userId },
  });

  if (!dbAccount) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const account = new Account(dbAccount.accessToken);
  const response = await account.performInitialSync();

  if (!response) {
    return NextResponse.json(
      { error: "Failed to perform initial sync" },
      { status: 500 },
    );
  }

  const { emails, deltaToken } = response;

  await db.account.update({
    where: { id: accountId.toString() },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncEmailsToDatabase(emails, accountId);

  console.log("sync completed", deltaToken);

  return NextResponse.json({ success: true }, { status: 200 });
};
