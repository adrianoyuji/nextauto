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

export enum Transmission {
  manual = "manual",
  automatic = "automatic",
  sequential = "sequential",
  CVT = "CVT",
}

export interface Years extends Document {
  firstYear: string;
  secondYear: string;
}

export interface Features extends Document {
  cylinders?: string;
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
  value: string;
  unit: Unit;
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
  year: Years;
  price: number;
  photo: Array<string>;
  ownerId: string;
  location: Location;
}

const SaleSchema: Schema = new Schema(
  {
    car_make: { type: String, required: true },
    car_model: { type: String, required: true },
    version: { type: String, required: true },
    mileage: {
      value: { type: String, required: true },
      unit: { type: String, required: true },
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    features: {
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
    year: {
      firstYear: { type: String, required: true },
      secondYear: { type: String, required: true },
    },
    price: { type: Number, required: true },
    photos: [],
    ownerId: { type: String, required: true },
    location: { state: { type: String }, country: { type: String } },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", SaleSchema);
