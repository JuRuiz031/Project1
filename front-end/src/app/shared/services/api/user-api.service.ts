import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserRegistrationDTO } from '../../models/auth/user-registration.dto';
import { UserResponseDTO } from '../../models/auth/user-response.dto';
import { LoginRequestDTO } from '../../models/auth/login-request.dto';
import { LoginSuccessDTO } from '../../models/auth/login-success.dto';
import { LoginStatusDTO } from '../../models/auth/login-status.dto';

/**
 * PATCH /users/{id} request body
 * (Only include fields you want to change.)
 */
export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
}

/**
 * DELETE /users/{id} response body (per Endpoints.md)
 */
export interface DeleteUserResponseDTO {
  user_id: string;
  deleted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * POST /users
   */
  register(dto: UserRegistrationDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.baseUrl}/users`, dto);
  }

  /**
   * POST /login
   */
  login(dto: LoginRequestDTO): Observable<LoginSuccessDTO> {
    return this.http.post<LoginSuccessDTO>(`${this.baseUrl}/login`, dto);
  }

  /**
   * GET /login
   */
  getLoginStatus(): Observable<LoginStatusDTO> {
    return this.http.get<LoginStatusDTO>(`${this.baseUrl}/login`);
  }

  /**
   * GET /users/{id}
   */
  getUserById(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.baseUrl}/users/${id}`);
  }

  /**
   * PATCH /users/{id}
   */
  updateUser(id: string, dto: UpdateUserDTO): Observable<UserResponseDTO> {
    return this.http.patch<UserResponseDTO>(`${this.baseUrl}/users/${id}`, dto);
  }

  /**
   * DELETE /users/{id}
   */
  deleteUser(id: string): Observable<DeleteUserResponseDTO> {
    return this.http.delete<DeleteUserResponseDTO>(`${this.baseUrl}/users/${id}`);
  }
}
