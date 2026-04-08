import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const BCRYPT_SALT_ROUNDS = 10;

export const generateAuthToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  const token = jwt.sign({ userId: id, email }, secret, {
    expiresIn: "10d",
  });
  return token;
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
