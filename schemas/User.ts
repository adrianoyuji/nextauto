import mongoose, { Schema, Document } from "mongoose";

export enum Gender {
  male = "male",
  female = "female",
  undisclosed = "undisclosed",
}
export enum Currency {
  usd = "usd",
  brl = "brl",
  cad = "cad",
}

export interface Address extends Document {
  country: string;
  state: string;
}
export interface Sales extends Document {
  post_id: string;
  post_thumb: string;
  post_name: string;
  post_price: string;
  post_currency: Currency;
}
export interface Contact extends Document {
  email: string;
  phone_number: string;
}

export interface IUser extends Document {
  email: string;
  first_name: string;
  last_name: string;
  accepted_terms: boolean;
  gender?: Gender;
  address: Address;
  createdAt: Date;
  pwd: string;
  posts: Array<Sales | []>;
  contact: Contact;
}

export const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    accepted_terms: { type: Boolean, required: true },
    gender: { type: String, enum: Object.values(Gender) },
    address: {
      country: { type: String },
      state: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    pwd: { type: String },
    sales: [],
    contact: { email: { type: String }, phone_number: { type: String } },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
