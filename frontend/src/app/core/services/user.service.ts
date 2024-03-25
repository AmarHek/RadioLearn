import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "@env/environment";
import {Role, User} from "app/core/models";

@Injectable({ providedIn: "root" })
export class UserService {

  url = environment.authentication;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>(this.url + "users");
  }

  getById(id: string) {
    return this.http.get<User>(this.url + "users/" + id);
  }

  changeUsername(id: string, newUsername: string, password: string) {
    return this.http.post<{message: string}>(this.url + "users/changeUsername/" + id,
      {
        newUsername,
        password
      });
  }

  changePassword(id: string, password: string, newPassword: string) {
    return this.http.post<{message: string}>(this.url + "users/changePassword/" + id,
      {
        password,
        newPassword
      });
  }

  deleteUser(id: string) {
    return this.http.delete<{message: string}>(this.url + "users/" + id);
  }

  changeRole(id: string, newRole: Role) {
    return this.http.post<{message: string}>(this.url + "users/changeRole/" + id,
      {newRole});
  }

  signUp(username: string, password: string, role: Role) {
    return this.http.post<{message: string}>(this.url + "signUp",
      {
        username,
        password,
        role
        }
      );
  }

}
