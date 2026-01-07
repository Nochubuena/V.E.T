import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalRecord {
  heartRate: number;
  temperature: number;
  status: string;
  time: string;
}

export interface IDog extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  ownerId: mongoose.Types.ObjectId;
  imageUri?: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  heartRate?: number;
  temperature?: number;
  vitalRecords?: IVitalRecord[];
  isDeceased?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VitalRecordSchema: Schema = new Schema({
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
}, { _id: false });

const DogSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },
    imageUri: {
      type: String,
    },
    breed: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    weight: {
      type: Number,
    },
    heartRate: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    vitalRecords: {
      type: [VitalRecordSchema],
      default: [],
    },
    isDeceased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
DogSchema.index({ ownerId: 1, name: 1 });

export default mongoose.model<IDog>('Dog', DogSchema, 'Dogs');

