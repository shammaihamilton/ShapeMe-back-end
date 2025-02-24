export interface AuthRequest extends Request {
    user?: Express.User;
  }
  
  export interface JWTPayload {
    id: string | undefined;
    role: string;
  }
  