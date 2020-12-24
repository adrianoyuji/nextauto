import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import { ObjectId } from "mongodb";
import verifyToken from "../../../../util/verifyToken";
import Joi from "joi";

const updateSchema = Joi.object({
  car_make: Joi.string().max(16),
  car_model: Joi.string(),
  version: Joi.string(),
  mileage: Joi.object({
    value: Joi.number().greater(0),
    unit: Joi.string(),
  }),
  description: Joi.string(),
  features: Joi.object({
    cylinders: Joi.string(),
    engine: Joi.string(),
    drive: Joi.string(),
    fuel: Joi.string(),
    color: Joi.string(),
    body_type: Joi.string(),
    title: Joi.string(),
    transmission: Joi.string(),
    hp: Joi.string(),
    doors: Joi.string(),
  }),
  year: Joi.number().greater(1940),
  price: Joi.object({
    value: Joi.number().greater(0),
    currency: Joi.string(),
  }),
  location: Joi.object({
    state: Joi.string(),
    country: Joi.string(),
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
      const auto = await db
        .collection("autos")
        .findOne({ _id: new ObjectId(id) });

      if (auto) {
        res.status(201).json({ auto: { ...auto } });
      } else {
        res.status(404).json({
          auto: {},
          message: "No auto sales matching this was id found...",
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

      const sale = await db
        .collection("autos")
        .findOne({ _id: new ObjectId(id) });

      if (sale) {
        await db
          .collection("autos")
          .updateOne({ _id: new ObjectId(id) }, { $set: { ...req.body } });

        const updatedSale = await db
          .collection("autos")
          .findOne({ _id: new ObjectId(id) });

        res.status(200).json({ auto: { ...updatedSale } });
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

      const foundSale = await db
        .collection("autos")
        .findOne({ _id: new ObjectId(id) });
      if (foundSale) {
        if (foundSale.ownerId === req.body.userId) {
          await db.collection("autos").deleteOne({ _id: new ObjectId(id) });

          res.status(200).json({
            auto: { ...foundSale },
            message: "Succesfully deleted.",
          });
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(404).json({
          auto: {},
          message: "No auto sales matching this was id found...",
        });
      }

      break;

    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
