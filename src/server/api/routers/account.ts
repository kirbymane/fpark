import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { emailAddressSchema } from "@/types";
import { Account } from "@/lib/account";

export const authoriseAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      name: true,
      accessToken: true,
    },
  });

  if (!account) {
    console.log("Account not found", accountId, userId);
    throw new Error("Account not found");
  }

  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });
  }),
  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      }

      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
    }),
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const acc = new Account(account.accessToken);
      acc.syncEmails().catch((e) => console.log("sync emails error", e));

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      }

      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),
  getSuggestion: privateProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      return await ctx.db.emailAddress.findMany({
        where: { accountId: account.id },
        select: { address: true, name: true },
      });
    }),

  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: { id: input.threadId },
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              from: true,
              cc: true,
              to: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });

      if (!thread || thread.emails.length === 0) {
        throw new Error("Thread not found");
      }

      // const lastExternalEmail = thread.emails.reverse().find((email) => {
      //   return email.from.address !== account.emailAddress;
      // });

      const lastExternalEmail = thread.emails[thread.emails.length - 1];

      if (!lastExternalEmail) {
        throw new Error("No external emails found");
      }

      return {
        subject: lastExternalEmail.subject,
        to: [
          lastExternalEmail.from,
          ...lastExternalEmail.to.filter(
            (t) => t.address !== account.emailAddress,
          ),
        ],
        cc: lastExternalEmail.cc.filter(
          (cc) => cc.address !== account.emailAddress,
        ),
        from: {
          name: account.name,
          address: account.emailAddress,
        },
        id: lastExternalEmail.internetMessageId,
      };
    }),
  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const acc = await authoriseAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const account = new Account(acc.accessToken);
      await account.sendEmail({
        body: input.body,
        subject: input.subject,
        threadId: input.threadId,
        to: input.to,
        bcc: input.bcc,
        cc: input.cc,
        replyTo: input.replyTo,
        from: input.from,
        inReplyTo: input.inReplyTo,
      });
    }),
});
