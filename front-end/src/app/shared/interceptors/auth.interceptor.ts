import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

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
            // If 401, token is invalid/expired - logout user
            if (error.status === 401) {
                console.warn('[Auth] Unauthorized - logging out...');
                localStorage.clear();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
}