import { model, Schema, Document } from 'mongoose';
// import bcrypt from 'bcrypt';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export const enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY= "Non-Binary"
}

export default interface User extends Document{
  fullName:string;
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
    FullName: {
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
      select:false
    },
    gender: {
      type: String,
      required: false,
      enum:[Gender.MALE,Gender.FEMALE,Gender.NON_BINARY],
      default:"Other"
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
      sparse:true
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

// schema.index({ _id: 1, status: 1 });
// schema.index({ email: 1 });
// schema.index({ status: 1 });

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
