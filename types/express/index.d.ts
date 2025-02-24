// types/express/index.d.ts
import { IUser } from "../../src/models/User";

declare global {
  namespace Express {
    interface User extends IUser {
      id: string; // Add explicit id property
      _id: string;
      toObject(): IUser & { _id: string };
    }
  }
}

export {};