import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStore {
  id: string;
  name: string;
  category: string;
  region_focus: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  description: string | null;
  products_and_specialties: string[];
  source_url: string | null;
  created_at: Date;
}

interface IStoreDocument extends Document {
  name: string;
  category: string;
  region_focus: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  description: string | null;
  products_and_specialties: string[];
  source_url: string | null;
  created_at: Date;
  name_lower?: string;
  city_lower?: string;
}

const storeSchema = new Schema<IStoreDocument>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    region_focus: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    province: { type: String, default: null },
    postal_code: { type: String, default: null },
    phone: { type: String, default: null },
    website: { type: String, default: null },
    email: { type: String, default: null },
    hours: { type: String, default: null },
    description: { type: String, default: null },
    products_and_specialties: { type: [String], default: [] },
    source_url: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    name_lower: { type: String, select: false },
    city_lower: { type: String, select: false },
  },
  {
    collection: "stores",
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.name_lower;
        delete ret.city_lower;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.name_lower;
        delete ret.city_lower;
        return ret;
      },
    },
  }
);

storeSchema.index({ city_lower: 1 });
storeSchema.index({ name_lower: 1 });
storeSchema.index({ category: 1 });
storeSchema.index({ created_at: -1 });

const Store: Model<IStoreDocument> =
  mongoose.models.Store ??
  mongoose.model<IStoreDocument>("Store", storeSchema);

export default Store;

export function toIStore(doc: IStoreDocument | Record<string, unknown>): IStore {
  const raw = doc as IStoreDocument & { _id?: { toString(): string } };
  const id =
    (raw as { id?: string }).id ??
    raw._id?.toString() ??
    String((raw as { _id?: unknown })._id);
  return {
    id,
    name: raw.name,
    category: raw.category,
    region_focus: raw.region_focus ?? null,
    address: raw.address ?? null,
    city: raw.city ?? null,
    province: raw.province ?? null,
    postal_code: raw.postal_code ?? null,
    phone: raw.phone ?? null,
    website: raw.website ?? null,
    email: raw.email ?? null,
    hours: raw.hours ?? null,
    description: raw.description ?? null,
    products_and_specialties: raw.products_and_specialties ?? [],
    source_url: raw.source_url ?? null,
    created_at: raw.created_at,
  };
}
