import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import Sale from "../../../../schemas/Sale";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const user = new Sale({
    email: "adriano",
    car_make: { ashjdios: "aaaa" },
    last_name: "   satoss",
    accepted_terms: true,
    gender: "male",
    address: {
      country: "Brazil",
      state: "MS",
    },
    pwd: "w12312",
    posts: [],
  });

  await db.collection("sales").insertOne(user);
  res.statusCode = 200;
  res.json(user);
};
