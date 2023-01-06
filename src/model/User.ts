import { model, Schema, Document } from 'mongoose';
// import bcrypt from 'bcrypt';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';


export default interface User extends Document{
  name:string;
  email?:string;
  password?:string;
  gender?: string;
  mobile?:string;
  birthday?:string;
  refreshToken?:string;
  verifiedEmail?:boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A user must have a name'],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'A user must have an email'],
      lowercase: true,
    },
    password: {
      type: String,
      minLength: 8,
      default: null,
    },
    gender: {
      type: String,
      required: false,
      enum:["male","female","non-binary","none"],
      default:"none"
    },
    mobile: {
      type: String,
      required: false,
      default:"+234"
    },
    birthday: {
      type: String,
      required: false,
      default:"12/09/1990"
    },
    refreshToken: {
      type: String,
      trim: true,
      default: null,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
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

// userSchema.pre('save', async function (next) {
//   if (!this.password) next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Instance method. method available in the whole model
// userSchema.methods.comparePassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   const passwordStatus = await bcrypt.compare(candidatePassword, userPassword);
//   return passwordStatus;
// };




// const User = mongoose.model('User', userSchema);

// module.exports = User;

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
