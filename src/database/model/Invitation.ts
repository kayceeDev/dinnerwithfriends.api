import { model, Schema, Document } from 'mongoose';
import User from './User';
import Event from './Event';

export const DOCUMENT_NAME = 'Invitation';
export const COLLECTION_NAME = 'invitations';

export const enum StatusCode {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}
export default interface Invitation {
  userId: User;
  email?: string;
  eventId: Event;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      lowercase: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: [StatusCode.PENDING, StatusCode.ACCEPTED, StatusCode.REJECTED],
      default: StatusCode.PENDING,
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
  {
    versionKey:false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate
schema.virtual('host_info', {
  ref: 'User',
  foreignField: '_id',
  localField: 'user_id',
});

export const InvitationModel = model<Invitation>(DOCUMENT_NAME, schema, COLLECTION_NAME);
