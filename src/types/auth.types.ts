export interface AuthRequest extends Request {
    user?: Express.User;
  }
  
  export interface JWTPayload {
    id: string;
    role: string;
  }
  