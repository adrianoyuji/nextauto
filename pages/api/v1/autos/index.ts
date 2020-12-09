import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../util/mongodb";
import Sale from "../../../../schemas/Sale";
import Joi from "joi";
import verifyToken from "../../../../util/verifyToken";
import { ObjectId } from "mongodb";

interface Year {
  $gte: number;
  $lte: number;
}
interface Price {
  $gte: number;
  $lte: number;
}
interface Mileage {
  $gte: number;
  $lte: number;
}

interface Filter {
  car_make: string | void;
  car_model: string | void;
  "features.body_type": string | void;
  year: Year;
  "price.value": Price;
  "mileage.value": Mileage;
}

interface SaleRef {
  post_id: string;
  post_thumb: string;
  post_car: string;
  post_year: number;
  post_model: string;
  post_price: {
    value: number;
    currency: string;
  };
  post_version: string;
}

const saleSchema = Joi.object({
  car_make: Joi.string().max(16).required(),
  car_model: Joi.string().required(),
  version: Joi.string().required(),
  mileage: Joi.object({
    value: Joi.number().greater(0).required(),
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
  year: Joi.number().greater(1940).required(),
  price: Joi.object({
    value: Joi.number().greater(0).required(),
    currency: Joi.string().required(),
  }),
  ownerId: Joi.string().min(23).required(),
  location: Joi.object({
    state: Joi.string().required(),
    country: Joi.string().required(),
  }),
});

const paramsSchema = Joi.object({
  page: Joi.number().min(0),
  make: Joi.string().alphanum(),
  model: Joi.string().alphanum(),
  bodyType: Joi.string().alphanum(),
  minYear: Joi.number().min(1940),
  maxYear: Joi.number(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number(),
  minMileage: Joi.number().min(0),
  maxMileage: Joi.number(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { db } = await connectToDatabase();
  switch (req.method) {
    case "GET":
      const {
        page = 0,
        make,
        model,
        bodyType,
        minYear,
        maxYear,
        minPrice,
        maxPrice,
        minMileage,
        maxMileage,
      } = JSON.parse(JSON.stringify(req.query));

      const paramsValidation = paramsSchema.validate(req.query);
      if (!!paramsValidation.error) {
        res.statusCode = 400;
        res.json({ error: paramsValidation.error });
        break;
      }

      let filters: Filter | {} = {};

      !!make && (filters = { ...filters, car_make: make });
      !!model && (filters = { ...filters, car_model: model });
      !!bodyType && (filters = { ...filters, "features.body_type": bodyType });

      filters = {
        ...filters,
        year: {
          $gte: parseInt(minYear) || 1940,
          $lte: parseInt(maxYear) || new Date().getFullYear(),
        },
      };
      filters = {
        ...filters,
        "price.value": {
          $gte: parseInt(minPrice) || 0,
          $lte: parseInt(maxPrice) || 9999999999,
        },
      };
      filters = {
        ...filters,
        "mileage.value": {
          $gte: parseInt(minMileage) || 0,
          $lte: parseInt(maxMileage) || 9999999999,
        },
      };

      const pagination = 10;
      const autos = await db
        .collection("autos")
        .find(filters)
        .limit(pagination)
        .skip(pagination * page)
        .toArray();
      res.status(201).json({ autos_for_sale: [...autos] });
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
        car_make: req.body.car_make.toLowerCase(),
        car_model: req.body.car_model.toLowerCase(),
        version: req.body.version.toLowerCase(),
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
        let newSaleRef: SaleRef = {
          post_id: newSale._id,
          post_thumb: "no",
          post_car: newSale.car_make,
          post_year: newSale.year,
          post_model: newSale.car_model,
          post_price: {
            value: newSale.price.value,
            currency: newSale.price.currency,
          },
          post_version: newSale.version,
        };
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(req.body.ownerId) },
            { $set: { sales: [...user.sales, newSaleRef] } }
          );

        res.status(201).json({ id: newSale._id });
      } catch (err) {
        res.status(502).json({ error: err });
      }
      break;
    default:
      res.status(405).json({ error: "Method not Allowed" });
  }
};
