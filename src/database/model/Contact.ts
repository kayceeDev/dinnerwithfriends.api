/* eslint-disable linebreak-style */
import { model, Schema, Document } from 'mongoose';


export const DOCUMENT_NAME = 'Contact';
export const COLLECTION_NAME = 'contacts';

export default interface Contact extends Document{
  email:string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema({
  email: {
    type: String,
    trim: true,
    required: [true, 'email field must be specified !!!'],
    lowercase: true,
    unique: true,
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
},{
  versionKey:false
});

export const ContactModel = model<Contact>(DOCUMENT_NAME, schema,COLLECTION_NAME);
