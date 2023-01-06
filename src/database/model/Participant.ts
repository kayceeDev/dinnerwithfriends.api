import { model, Schema, Document } from 'mongoose';
import Event from './Event';



export const DOCUMENT_NAME = 'Participant';
export const COLLECTION_NAME = 'participants';

export default interface Participant extends Document {
  fullName:string;
  email?:string;
  eventId:Event;
  preferredDateTime?:string;
  createdAt?: Date;
  updatedAt?: Date;
}


const schema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'fullname can\'t be less than 3 characters'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'email field must be specified !!!'],
    lowercase: true,
    index:true
  },
  eventId:{
    type:Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  preferredDateTime: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
    select: false,
  },
  updatedAt: {
    type: Date,
    required: true,
    select: false,
  },

},
{ versionKey:false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// schema.index({ _id: 1, email: 1 });
// schema.index({ email: 1 });

export const ParticipantModel = model<Participant>(DOCUMENT_NAME, schema,COLLECTION_NAME);

