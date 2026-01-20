import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponseDTO } from '../models/auth/user-response.dto';
import { UserRegistrationDTO } from '../models/auth/user-registration.dto';
import { LoginRequestDTO } from '../models/auth/login-request.dto';
import { LoginSuccessDTO } from '../models/auth/login-success.dto';

// Service to handle user registration and login
@Injectable({
  providedIn: 'root'
})
export class UserService {
    private baseURL = 'http://localhost:8080/api/v1';

    constructor(private http: HttpClient) {}

    // Register a new user
    register(body: UserRegistrationDTO): Observable<UserResponseDTO> {
        return this.http.post<UserResponseDTO>(`${this.baseURL}/users`, body);
    }

    // Login an existing user
    login(body: LoginRequestDTO): Observable<LoginSuccessDTO> {
        return this.http.post<LoginSuccessDTO>(`${this.baseURL}/login`, body);
    }

    getById(id: string): Observable<UserResponseDTO> {
        return this.http.get<UserResponseDTO>(`${this.baseURL}/users/${id}`);
    }

}