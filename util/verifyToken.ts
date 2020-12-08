import { defaults } from "joi";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
const { TOKEN_SECRET } = process.env;

interface Request {
  req: NextApiRequest;
  res: NextApiResponse;
}

const verifyToken = ({ req, res }: Request) => {
  const token = req.headers["auth-token"];
  if (!token) return false;

  try {
    const verified = jwt.verify(token.toString(), TOKEN_SECRET);
    return verified ? true : false;
  } catch (err) {
    return false;
  }
};

export default verifyToken;
