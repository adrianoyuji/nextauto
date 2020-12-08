// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { TOKEN_SECRET } = process.env;

const authSchema = Joi.object({
  email: Joi.string().required().email(),
  pwd: Joi.string().required(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //connect to database
  const { db } = await connectToDatabase();
  switch (req.method) {
    case "POST":
      //validate body req
      const { error } = authSchema.validate(req.body);
      if (!!error) {
        res.status(400).json({ error: error });
        break;
      }

      //check if email exists
      const user = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (!user) {
        res.status(400).json({ error: "Invalid email" });
        break;
      }

      //checks if password is correct
      const validPwd = await bcrypt.compare(req.body.pwd, user.pwd);
      if (!validPwd) {
        res.status(400).json({ error: "Invalid password" });
      } else {
        const token = jwt.sign({ _id: user._id }, TOKEN_SECRET);
        res.status(200).json({ user: user, token: token });
      }

      break;
    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
