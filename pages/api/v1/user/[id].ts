import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import { ObjectId } from "mongodb";
import verifyToken from "../../../../util/verifyToken";
import Joi from "joi";
import bcrypt from "bcrypt";

const updateSchema = Joi.object({
  first_name: Joi.string().min(6),
  last_name: Joi.string().min(6),
  address: Joi.object({
    state: Joi.string(),
    country: Joi.string(),
  }),
  gender: Joi.string(),
  contact: Joi.object({
    email: Joi.string().min(6).email(),
    phone_number: Joi.string(),
  }),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  const { id } = JSON.parse(JSON.stringify(req.query));
  if (id.length !== 24) {
    res.status(400).json({ auto: {}, error: "Invalid id" });
  }
  switch (req.method) {
    case "GET":
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });

      if (user) {
        res.status(201).json({
          user: {
            _id: user._id,
            sales: user.sales,
            contacts: user.contacts,
            first_name: user.first_name,
            last_name: user.last_name,
            gender: user.gender,
            address: user.address,
          },
        });
      } else {
        res.status(404).json({
          user: {},
          message: "No user matching this was id found...",
        });
      }

      break;
    case "PATCH":
      const validToken = verifyToken({ req, res });
      if (!validToken) {
        res.status(401).json({ message: "unauthorized" });
        break;
      }
      const { error } = updateSchema.validate(req.body);
      if (!!error) {
        res.status(400).json({ message: error });
        break;
      }

      const userData = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });

      if (userData) {
        await db
          .collection("users")
          .updateOne({ _id: new ObjectId(id) }, { $set: { ...req.body } });

        const updatedUser = await db
          .collection("users")
          .findOne({ _id: new ObjectId(id) });

        res.status(200).json({ auto: { ...updatedUser } });
      } else {
        res.status(404).json({
          auto: {},
          message: "No auto sales matching this id was found...",
        });
      }
      break;

    case "DELETE":
      const validateToken = verifyToken({ req, res });
      if (!validateToken) {
        res.status(401).json({ message: "unauthorized" });
        break;
      }

      const foundUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });

      if (foundUser) {
        if (await bcrypt.compare(req.body.pwd, foundUser.pwd)) {
          await db.collection("users").deleteOne({ _id: new ObjectId(id) });
          await db.collection("autos").deleteMany({ ownerId: id });

          res.status(200).json({
            auto: { ...foundUser },
            message: "Succesfully deleted.",
          });
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(404).json({
          auto: {},
          message: "No user matching this id was found...",
        });
      }

      break;

    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
