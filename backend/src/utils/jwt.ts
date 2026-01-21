// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// export const generateToken = (userId: string): string => {
//   return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
// };

// export const verifyToken = (token: string): any => {
//   return jwt.verify(token, JWT_SECRET);
// };

import jwt from "jsonwebtoken";

type TokenPayload = {
  id: string;
  role?: string;
};

export const generateToken = (payload: TokenPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  // Ensure types align with jsonwebtoken's expectations
  const secret: jwt.Secret = JWT_SECRET as jwt.Secret;
  // process.env values are strings; cast to any to satisfy the SignOptions type
  const expiresIn: any = process.env.JWT_EXPIRE || "7d";
  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign({ id: payload.id, role: payload.role }, secret, options);
};


