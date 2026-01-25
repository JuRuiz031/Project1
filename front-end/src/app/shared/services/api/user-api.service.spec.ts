import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserApiService, UpdateUserDTO, DeleteUserResponseDTO } from './user-api.service';

import { LoginRequestDTO } from '../../models/auth/login-request.dto';
import { LoginSuccessDTO } from '../../models/auth/login-success.dto';
import { LoginStatusDTO } from '../../models/auth/login-status.dto';
import { UserRegistrationDTO } from '../../models/auth/user-registration.dto';
import { UserResponseDTO } from '../../models/auth/user-response.dto';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserApiService],
    });

    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login() should POST /login and return LoginSuccessDTO', () => {
    const body: LoginRequestDTO = { username: 'alice_c', password: 'password123' };

    // IMPORTANT: use the exact field name defined in your LoginSuccessDTO
    const mockResponse: LoginSuccessDTO = {
      token: 'fake.jwt.token',
      user: { user_id: '3', username: 'alice_c', email: 'alice@example.com' },
      expires_at: '2024-04-01T12:00:00Z',
    } as LoginSuccessDTO;

    service.login(body).subscribe((res) => {
      expect(res.token).toBe('fake.jwt.token');
      expect(res.user.user_id).toBe('3');
      expect(res.user.username).toBe('alice_c');
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush(mockResponse);
  });

  it('getLoginStatus() should GET /login', () => {
    const mockStatus: LoginStatusDTO = {
      authenticated: true,
      user: { user_id: '3', username: 'alice_c' },
      token_expires_at: '2024-04-01T12:00:00Z',
    };

    service.getLoginStatus().subscribe((res) => {
      expect(res.authenticated).toBe(true);
      expect(res.user?.user_id).toBe('3');
      expect(res.user?.username).toBe('alice_c');
      expect(res.token_expires_at).toBe('2024-04-01T12:00:00Z');
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('GET');

    req.flush(mockStatus);
  });

  it('register() should POST /users and return UserResponseDTO', () => {
    const dto: UserRegistrationDTO = {
      username: 'new_user',
      email: 'new_user@example.com',
      password: 'password123',
    };

    const mockResponse: UserResponseDTO = {
      user_id: '10',
      username: 'new_user',
      email: 'new_user@example.com',
    };

    service.register(dto).subscribe((res) => {
      expect(res.user_id).toBe('10');
      expect(res.username).toBe('new_user');
      expect(res.email).toBe('new_user@example.com');
    });

    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('getUserById() should GET /users/{id}', () => {
    const mockResponse: UserResponseDTO = {
      user_id: '3',
      username: 'alice_c',
      email: 'alice@example.com',
    };

    service.getUserById('3').subscribe((res) => {
      expect(res.user_id).toBe('3');
      expect(res.email).toBe('alice@example.com');
    });

    const req = httpMock.expectOne(`${baseUrl}/users/3`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('updateUser() should PATCH /users/{id}', () => {
    const dto: UpdateUserDTO = { email: 'alice2@example.com' };

    const mockResponse: UserResponseDTO = {
      user_id: '3',
      username: 'alice_c',
      email: 'alice2@example.com',
    };

    service.updateUser('3', dto).subscribe((res) => {
      expect(res.user_id).toBe('3');
      expect(res.email).toBe('alice2@example.com');
    });

    const req = httpMock.expectOne(`${baseUrl}/users/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(mockResponse);
  });

  it('deleteUser() should DELETE /users/{id}', () => {
    const mockResponse: DeleteUserResponseDTO = { user_id: '3', deleted: true };

    service.deleteUser('3').subscribe((res) => {
      expect(res.user_id).toBe('3');
      expect(res.deleted).toBe(true);
    });

    const req = httpMock.expectOne(`${baseUrl}/users/3`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);
  });
});
