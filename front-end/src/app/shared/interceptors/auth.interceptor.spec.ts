import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should NOT add Authorization header for POST /api/v1/login (public endpoint)', () => {
    localStorage.setItem('token', 'abc123');

    http.post('http://localhost:8080/api/v1/login', { username: 'a', password: 'b' })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ ok: true });
  });

  it('should NOT add Authorization header for POST /api/v1/users (public endpoint)', () => {
    localStorage.setItem('token', 'abc123');

    http.post('http://localhost:8080/api/v1/users', { username: 'a', email: 'e', password: 'b' })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ ok: true });
  });

  it('should add Authorization header for non-public endpoints when token exists', () => {
    localStorage.setItem('token', 'abc123');

    http.get('http://localhost:8080/api/v1/calendar').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/calendar');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');

    req.flush({ ok: true });
  });

  it('should add Authorization header for GET /api/v1/login when token exists (NOT a public POST endpoint)', () => {
    localStorage.setItem('token', 'abc123');

    http.get('http://localhost:8080/api/v1/login').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/login');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');

    req.flush({ ok: true });
  });

  it('should NOT add Authorization header when token does not exist', () => {
    // no token set
    http.get('http://localhost:8080/api/v1/calendar').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/calendar');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ ok: true });
  });
});
