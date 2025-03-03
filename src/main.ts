import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

// ✅ Import OpenAPI-generated API module
import { ApiModule } from './app/api/api.module';
import { apiConfigFactory } from './app/api/config/config.factory'; // Corrected path

// ✅ Import the AuthInterceptor
import { AuthInterceptor } from './app/demo/pages/authentication/auth.interceptor'; // Adjust path if needed

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, ApiModule.forRoot(apiConfigFactory)), // Pass the config factory
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthInterceptor])) // ✅ Register the interceptor here
  ]
}).catch((err) => console.error(err));
