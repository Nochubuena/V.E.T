import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalRecord {
  heartRate: number;
  temperature: number;
  status: string;
  time: string;
}

export interface IDog extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  imageUri?: string;
  heartRate?: number;
  temperature?: number;
  vitalRecords?: IVitalRecord[];
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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
DogSchema.index({ ownerId: 1, name: 1 });

export default mongoose.model<IDog>('Dog', DogSchema, 'Dogs');

