export type TAuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "SURVEYOR" | "ADMIN";
  isSubscribed: boolean;
  profilePhoto?: string;
};
