import mongoose, { Schema, Document } from 'mongoose';

export interface ISectionDoc extends Document {
  name: string;
  schoolId: mongoose.Types.ObjectId;
  staffIds: mongoose.Types.ObjectId[];
  studentIds: mongoose.Types.ObjectId[];
}

const sectionSchema = new Schema<ISectionDoc>(
  {
    name: { type: String, required: true, trim: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    staffIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

const Section = mongoose.model<ISectionDoc>('Section', sectionSchema);

export default Section;
