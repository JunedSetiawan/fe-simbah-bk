export type ProfileType =
  | "Super Admin"
  | "Umum"
  | "Guru"
  | "Siswa"
  | "Orang Tua";

export interface User {
  id: string;
  username: string;
  profileType: ProfileType;
  createdAt: string;
  updatedAt: string;
  teacher?: any;
  student?: any;
  parent?: any;
}
