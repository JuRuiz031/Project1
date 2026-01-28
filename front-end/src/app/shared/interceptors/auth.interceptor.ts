import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const http = inject(HttpClient);

    const isPublicEndpoint = 
      (req.method === 'POST' && req.url.endsWith('/api/v1/users')) ||
      (req.method === 'POST' && req.url.endsWith('/api/v1/login')) ||
      (req.method === 'POST' && req.url.includes('/api/v1/invites/events/guest/')); // Guest access without JWT

    if (isPublicEndpoint) {
        return next(req); // skip adding token for public auth endpoints
    }

    // Read token from local storage
    const token = localStorage.getItem('token');

    // If no token, continue without adding header
    if (!token) {
        return next(req);
    }

    // Clone the request to add the new header
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authReq).pipe(
        catchError((error) => {
            // If 401 and not already refreshing, attempt token refresh
            if (error.status === 401 && !isRefreshing && !req.url.endsWith('/api/v1/refresh')) {
                // Check if token expired within grace period (5 minutes)
                const expiresAt = localStorage.getItem('expiresAt');
                if (expiresAt) {
                    const now = Date.now();
                    const expirationTime = new Date(expiresAt).getTime();
                    const expiredFor = now - expirationTime;
                    const GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes

                    if (expiredFor > GRACE_PERIOD) {
                        // Token expired too long ago, force logout
                        console.warn('[Auth] Token expired beyond grace period. Logging out...');
                        localStorage.clear();
                        router.navigate(['/login']);
                        return throwError(() => error);
                    }
                }

                isRefreshing = true;

                console.log('[Auth] Token expired, attempting refresh...');

                return http.post<any>('http://localhost:8080/api/v1/refresh', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).pipe(
                    switchMap((response) => {
                        isRefreshing = false;

                        // Save new token and expiration
                        localStorage.setItem('token', response.token);
                        localStorage.setItem('expiresAt', response.expires_at);
                        console.log('[Auth] Token refreshed successfully');

                        // Retry original request with new token
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${response.token}` }
                        });
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        isRefreshing = false;

                        // If refresh fails, logout user
                        console.warn('[Auth] Token refresh failed. Logging out...');
                        localStorage.clear();
                        router.navigate(['/login']);
                        return throwError(() => refreshError);
                    })
                );
            }

            // For other errors or if already refreshing, just pass through
            return throwError(() => error);
        })
    );
}