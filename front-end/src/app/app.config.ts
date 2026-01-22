import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
=======
import { provideHttpClient } from '@angular/common/http';
>>>>>>> skeleton

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
=======
    provideRouter(routes)
    // provide HttpClient()
>>>>>>> skeleton
  ]
};
