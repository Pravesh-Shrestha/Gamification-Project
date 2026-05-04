import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolDoc extends Document {
  name: string;
  domain?: string;
  license?: mongoose.Types.ObjectId;
  adminIds?: mongoose.Types.ObjectId[];
}

const schoolSchema = new Schema<ISchoolDoc>(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, trim: true },
    license: { type: Schema.Types.ObjectId, ref: 'License' },
    adminIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const School = mongoose.model<ISchoolDoc>('School', schoolSchema);

export default School;
