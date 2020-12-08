// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import Joi from "joi";
import User from "../../../../schemas/User";
import bcrypt from "bcrypt";

const registerSchema = Joi.object({
  first_name: Joi.string().min(6).required(),
  last_name: Joi.string().min(6).required(),
  email: Joi.string().min(6).required().email(),
  pwd: Joi.string().min(6).required(),
  accepted_terms: Joi.bool().required(),
  address: Joi.object({
    state: Joi.string().required(),
    country: Joi.string().required(),
  }),
  gender: Joi.string().required(),
  contact: Joi.object({
    email: Joi.string().min(6).required().email(),
    phone_number: Joi.string(),
  }),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      const { db } = await connectToDatabase();
      //validate the req body
      const { error } = registerSchema.validate(req.body);
      if (!!error) {
        res.statusCode = 400;
        res.json({ error: error });
        break;
      }

      //check if email is duplicate
      const emailExist = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (emailExist) {
        res.statusCode = 400;
        res.json({ error: "Email already exists" });
        break;
      }

      //hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.pwd, salt);

      //create new user
      const user = new User({
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        accepted_terms: req.body.accepted_terms,
        gender: req.body.gender,
        address: req.body.address,
        pwd: hashedPassword,
        sales: [],
      });
      try {
        await db.collection("users").insertOne(user);
        res.status(201).json({ user: user._id });
      } catch (err) {
        res.status(502).json({ error: err });
      }
      break;
    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
