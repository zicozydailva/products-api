import { Types } from 'mongoose';

export interface IUser {
  _id?: string | Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}
