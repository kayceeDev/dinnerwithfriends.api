import { model, Schema, Document } from 'mongoose';
import User from './User';

export const DOCUMENT_NAME = 'AcountRecovery';
export const COLLECTION_NAME = 'acountRecoveries';

export default interface AccountRecovery{
  userId:User;
  email?:string;
  token?:string;
  expiresAt?:Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      trim: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
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
  }
);

export const  AccountRecoveryModel = model<AccountRecovery>(DOCUMENT_NAME, schema,COLLECTION_NAME);

