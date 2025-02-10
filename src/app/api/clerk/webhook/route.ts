import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data }: { data: any } = await req.json();
  const id = data.id;
  const email = data.email_addresses[0].email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const imageUrl = data.image_url;

  await db.user.create({
    data: {
      id,
      email,
      firstName,
      lastName,
      imageUrl,
    },
  });

  return new Response("Webhook received", { status: 200 });
};
