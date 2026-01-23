import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponseDTO {
  user_id: string;
  username: string;
  email: string;
  is_superuser: boolean;
}

export interface UpdateUserDTO {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, dto: UpdateUserDTO): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.baseUrl}/users/${id}`, dto);
  }

}
