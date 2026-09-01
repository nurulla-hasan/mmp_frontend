import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "SURVEYOR" | "ADMIN" | "SUPER_ADMIN";
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}