import { model, Schema, Document } from 'mongoose';
import User from './User';

export const DOCUMENT_NAME = 'Event';
export const COLLECTION_NAME = 'events';

export const enum PublishedStatus {
  DECIDED = 'decided',
  UNDECIDED = 'not-decided',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export default interface Event extends Document {
  userId: User;
  eventTitle?: string;
  eventDescription?: string;
  location?: string;
  eventType?: string;
  participantNumber?: number;
  startDate?: string;
  endDate?: string;
  published:string;
  hostPreferredTime:string;
  finalEventDate:string;
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
    eventTitle: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: [3, `event title can't be less than 3 characters`],
    },

    eventDescription: {
      type: Schema.Types.String,
      trim: true,
      minlength: [3, `event description can't be less than 3 characters`],
    },
    location: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: [3, `location can't be less than 3 characters`],
    },

    eventType: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: [3, `event type can't be less than 3 characters`],
    },

    participantNumber: {
      type: Schema.Types.Number,
      required: true,
    },

    startDate: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },

    endDate: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    published: {
      type: String,
      trim: true,
      enum: [
        PublishedStatus.ENDED,
        PublishedStatus.DECIDED,
        PublishedStatus.CANCELLED,
        PublishedStatus.ENDED,
      ],
      default: PublishedStatus.UNDECIDED,
    },
    finalEventDate: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    hostPreferredTime: {
      type: Schema.Types.String,
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
  { versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Virtual populate
schema.virtual('host_info', {
  ref: 'User',
  foreignField: '_id',
  localField: 'user_id',
});

export const EventModel = model<Event>(DOCUMENT_NAME, schema, COLLECTION_NAME);
