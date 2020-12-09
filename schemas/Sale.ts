import mongoose, { Schema, Document } from "mongoose";

export enum Unit {
  km = "km",
  miles = "miles",
}

export enum Drive {
  AWD = "AWD",
  FWD = "FWD",
  RWD = "RWD",
}

export enum Fuel {
  gasoline = "gasoline",
  ethanol = "ethanol",
  diesel = "diesel",
  eletric = "eletric",
}

export enum BodyType {
  cargo_van = "cargo_van",
  convertible = "convertible",
  hatchback = "hatchback",
  minivan = "minivan",
  passenger_van = "passenger_van",
  pickup = "pickup",
  suv = "suv",
  sedan = "sedan",
  wagon = "wagon",
  coupe = "coupe",
  super = "super",
}

export enum Title {
  clean = "clean",
  salvage = "salvage",
  junk = "junk",
  bonded = "bonded",
  reconstructed = "reconstructed",
  affidavit = "affidavit",
  rebuild = "rebuilt",
  import = "import",
}
export enum Currency {
  USD = "USD",
  CAD = "CAD",
  BRL = "BRL",
}

export enum Transmission {
  manual = "manual",
  automatic = "automatic",
  sequential = "sequential",
  CVT = "CVT",
}

export interface Features extends Document {
  cylinders?: string;
  engine?: string;
  drive: Drive;
  fuel: Fuel;
  color: string;
  body_type: BodyType;
  title: Title;
  transmission: Transmission;
  hp?: string;
  doors: string;
}

export interface Mileage extends Document {
  value: number;
  unit: Unit;
}
export interface Price extends Document {
  value: number;
  currency: Currency;
}
export interface Location extends Document {
  state: string;
  country: Unit;
}

export interface ISale extends Document {
  car_make: string;
  car_model: string;
  version: string;
  mileage: Mileage;
  description: string;
  createdAt: Date;
  features: Features;
  year: Number;
  price: Price;
  photo: Array<string>;
  ownerId: string;
  location: Location;
}

export const SaleSchema: Schema = new Schema(
  {
    car_make: { type: String, required: true },
    car_model: { type: String, required: true },
    version: { type: String, required: true },
    mileage: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    features: {
      engine: { type: String },
      cylinders: { type: String },
      drive: { type: String, required: true },
      fuel: { type: String, required: true },
      color: { type: String, required: true },
      body_type: { type: String, required: true },
      title: { type: String, required: true },
      transmission: { type: String, required: true },
      hp: { type: String },
      doors: { type: String },
    },
    year: { type: Number, required: true },
    price: {
      value: { type: Number, required: true },
      currency: { type: String, required: true },
    },
    photos: [],
    ownerId: { type: String, required: true },
    location: { state: { type: String }, country: { type: String } },
  },
  { timestamps: true }
);
export default mongoose.models.Sale ||
  mongoose.model<ISale>("Sale", SaleSchema);
