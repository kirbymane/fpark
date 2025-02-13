import {
  create,
  insert,
  search,
  save,
  load,
  type AnyOrama,
} from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";
import { db } from "@/server/db";

export class OramaManager {
  // @ts-ignore
  private orama: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async initialize() {
    const account = await db.account.findUnique({
      where: { id: this.accountId.toString() },
    });

    if (!account) throw new Error("Account not found");

    if (account.oramaIndexColumn) {
      this.orama = await restore("json", account.oramaIndexColumn as any);
    } else {
      this.orama = await create({
        schema: {
          title: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          sentAt: "string",
          embeddings: "vector[1536]",
          threadId: "string",
        },
      });
      await this.saveIndex();
    }
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }

  //   async vectorSearch({
  //     prompt,
  //     numResults = 10,
  //   }: {
  //     prompt: string;
  //     numResults?: number;
  //   }) {
  //     const embeddings = await getEmbeddings(prompt);
  //     const results = await search(this.orama, {
  //       mode: "hybrid",
  //       term: prompt,
  //       vector: {
  //         value: embeddings,
  //         property: "embeddings",
  //       },
  //       similarity: 0.8,
  //       limit: numResults,
  //     });
  //     return results;
  //   }

  async search({ term }: { term: string }) {
    console.log("Searching for", term);
    return await search(this.orama, {
      term,
    });
  }

  async saveIndex() {
    const index = await persist(this.orama, "json");
    await db.account.update({
      where: { id: this.accountId.toString() },
      data: { oramaIndexColumn: index as Buffer },
    });
  }
}
