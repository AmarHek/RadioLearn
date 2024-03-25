import {Role} from "./role";

export class User {
  id: string;
  username: string;
  role: Role;
  accessToken?: string;
}
