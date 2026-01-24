import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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

    return next(authReq); // Pass modified request to next handler
}