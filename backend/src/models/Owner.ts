import mongoose, { Schema, Document } from 'mongoose';

export interface IOwner extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model stores user data in the 'Users' collection in MongoDB
export default mongoose.model<IOwner>('Owner', OwnerSchema, 'Users');

