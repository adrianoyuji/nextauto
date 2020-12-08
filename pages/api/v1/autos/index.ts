import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import Sale from "../../../../schemas/Sale";
import Joi from "joi";
import verifyToken from "../../../../util/verifyToken";
import { ObjectId } from "mongodb";

const saleSchema = Joi.object({
  car_make: Joi.string().required(),
  car_model: Joi.string().required(),
  version: Joi.string().required(),
  mileage: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string().required(),
  }),
  description: Joi.string(),
  features: Joi.object({
    cylinders: Joi.string(),
    engine: Joi.string(),
    drive: Joi.string().required(),
    fuel: Joi.string().required(),
    color: Joi.string().required(),
    body_type: Joi.string().required(),
    title: Joi.string().required(),
    transmission: Joi.string().required(),
    hp: Joi.string(),
    doors: Joi.string(),
  }),
  year: Joi.object({
    firstYear: Joi.number().required(),
    secondYear: Joi.number().required(),
  }),
  price: Joi.object({
    value: Joi.number().required(),
    currency: Joi.string().required(),
  }),
  ownerId: Joi.string().min(23).required(),
  location: Joi.object({
    state: Joi.string().required(),
    country: Joi.string().required(),
  }),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  switch (req.method) {
    case "GET":
      const queries = {
        car_make: req.query.make,
        car_model: req.query.model,
        body_type: req.query.bodyType,
        min_year: req.query.minYear,
        max_year: req.query.maxYear,
        min_price: req.query.minPrice,
        max_price: req.query.maxPrice,
        min_mileage: req.query.minMileage,
        max_mileage: req.query.maxMileage,
      };

      let filters = {};
      for (let param in queries) {
        if (!!queries[param]) {
          filters = { ...filters, [param]: queries[param] };
        }
      }
      //fix db querries

      const autos = await db
        .collection("autos")
        .find({ ...filters })
        .toArray();

      res.status(201).json({ autos: [...autos] });

      break;

    case "POST":
      const validToken = verifyToken({ req, res });
      if (!validToken) {
        res.status(401).json({ error: "unauthorized" });
        break;
      }
      const { error } = saleSchema.validate(req.body);
      if (!!error) {
        res.status(400).json({ error: error });
        break;
      }
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(req.body.ownerId) });
      if (!user) {
        res.status(400).json({ error: "Owner Id does not exist" });
        break;
      }

      const newSale = new Sale({
        car_make: req.body.car_make,
        car_model: req.body.car_model,
        version: req.body.version,
        mileage: req.body.mileage,
        description: req.body.description,
        features: req.body.features,
        year: req.body.year,
        price: req.body.price,
        ownerId: user._id,
        location: req.body.location,
      });
      try {
        await db.collection("autos").insertOne(newSale);
        res.status(201).json({ id: newSale._id });
      } catch (err) {
        res.status(502).json({ error: err });
      }
      break;
    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
