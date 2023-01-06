import { Schema, model, Document } from 'mongoose';

export const DOCUMENT_NAME = 'ParticipantCount';
export const COLLECTION_NAME = 'participantCounts';

export default interface ParticipantCount {
  eventId:string;
  count?:number;
  createdAt?: Date;
  updatedAt?: Date;
} 

const schema = new Schema(
  {
    eventId:{
        type:Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        unique:true
      },
      count:{
        type:Schema.Types.Number,
        required:true
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
  {versionKey:false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const ParticipantCountModel = model<ParticipantCount>(DOCUMENT_NAME, schema,COLLECTION_NAME);
