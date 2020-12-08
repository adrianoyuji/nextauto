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
  switch (req.method) {
    case "POST":
      const { db } = await connectToDatabase();

      //validate body req
      const { error } = authSchema.validate(req.body);
      if (!!error) {
        res.statusCode = 400;
        res.json({ error: error });
        break;
      }

      //check if email exists
      const user = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (!user) {
        res.statusCode = 400;
        res.json({ error: "Invalid email" });
        break;
      }

      //checks if password is correct
      const validPwd = await bcrypt.compare(req.body.pwd, user.pwd);
      if (!validPwd) {
        res.status(400);
        res.json({ error: "Invalid password" });
      } else {
        const token = jwt.sign({ _id: user._id }, TOKEN_SECRET);
        res.status(200);

        res.json({ user: user, token: token });
      }

      break;
    default:
      res.statusCode = 405;
      res.json({ error: "Method not Allowed" });
  }
};
