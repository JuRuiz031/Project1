# Frontend-Backend Integration Guide

## 📋 Overview
This guide shows how to connect the Angular frontend to the Spring Boot backend for the Calendario API.

---

## 🔧 Setup - ALL THREE Must Be Running!

You need **3 terminal windows** open simultaneously:

### Terminal 1: Start MongoDB
```bash
# From project root
docker compose up -d
```

### Terminal 2: Start Backend (Spring Boot)
```bash
# Navigate to backend directory
cd back-end

# Run Spring Boot application
./mvnw spring-boot:run
```

**Backend runs on:** `http://localhost:8080`  
**API base path:** `http://localhost:8080/api/v1`

### Terminal 3: Start Frontend (Angular)
```bash
# Navigate to frontend directory
cd front-end

# Install dependencies (first time only)
npm install

# Start Angular dev server
ng serve
```

**Frontend runs on:** `http://localhost:4200`  
**Open browser to:** `http://localhost:4200`

### ✅ Verify Everything is Running
- MongoDB: `docker ps` (should show MongoDB container)
- Backend: Visit `http://localhost:8080` (should see error page, not "connection refused")
- Frontend: Visit `http://localhost:4200` (should see your app)

**Keep all 3 terminals open while developing!**

---

## 🎯 Frontend Setup (Already Done!)

### ✅ HTTP Client & Interceptor Already Configured

**Location:** `src/app/app.config.ts`
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

**The interceptor automatically adds JWT to all requests!**

---

## 🔐 Authentication Flow (Working Example)

### Step 1: User Service (Already Implemented)
**Location:** `src/app/shared/services/user.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
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
```

### Step 2: DTOs (Must Match Backend 1:1)
**Location:** `src/app/shared/models/auth/`

**Rule:** Field names must use **snake_case** to match backend JSON!

```typescript
// login-request.dto.ts
export interface LoginRequestDTO {
  username: string;
  password: string;
}

// user-registration.dto.ts
export interface UserRegistrationDTO {
  username: string;
  email: string;
  password: string;
}

// login-success.dto.ts
export interface LoginSuccessDTO {
  token: string;
  user: UserResponseDTO;
  expires_at: string;  // ← snake_case!
}

// user-response.dto.ts
export interface UserResponseDTO {
  user_id: string;      // ← snake_case!
  username: string;
  email: string;
  is_superuser: boolean; // ← snake_case!
}
```

### Step 3: Store JWT Token After Login
```typescript
// In your login component
loginUser() {
  this.userService.login(this.loginData).subscribe({
    next: (response: LoginSuccessDTO) => {
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('Login failed:', err);
    }
  });
}
```

---

## 🚀 How to Add New Endpoints (Step-by-Step)

### Example: Adding Calendar Endpoints

#### Step 1: Find Backend Controller
**Location:** `back-end/src/main/java/com/example/calendario/controller/CalendarController.java`

```java
@PostMapping("/calendar")
public ResponseEntity<CalendarResponseDTO> createCalendar(
    @Valid @RequestBody CalendarCreateRequestDTO requestDTO)

@PatchMapping("/calendar/{calendar_id}")
public ResponseEntity<CalendarUpdateResponseDTO> updateCalendar(
    @PathVariable("calendar_id") String calendarId,
    @Valid @RequestBody CalendarUpdateRequestDTO requestDTO)

@DeleteMapping("/calendar/{calendar_id}")
public ResponseEntity<Void> deleteCalendar(
    @PathVariable("calendar_id") String calendarId)
```

#### Step 2: Look at Backend DTOs
**Location:** `back-end/src/main/java/com/example/calendario/dto/calendar/`

```java
// CalendarCreateRequestDTO.java
{
    "name": "string"
}

// CalendarResponseDTO.java
{
    "calendar_id": "string",
    "name": "string"
}
```

#### Step 3: Create Frontend DTOs (Match 1:1)
**Location:** `src/app/shared/models/calendar/`

```typescript
// calendar-create-request.dto.ts
export interface CalendarCreateRequestDTO {
  name: string;
}

// calendar-response.dto.ts
export interface CalendarResponseDTO {
  calendar_id: string;  // ← Matches backend JSON
  name: string;
}

// calendar-update-request.dto.ts
export interface CalendarUpdateRequestDTO {
  name?: string;
  admins?: string[];
}

// calendar-update-response.dto.ts
export interface CalendarUpdateResponseDTO {
  calendar_id: string;
  name: string;
  admins: string[];
}
```

#### Step 4: Create Service
**Location:** `src/app/shared/services/calendar.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarCreateRequestDTO } from '../models/calendar/calendar-create-request.dto';
import { CalendarResponseDTO } from '../models/calendar/calendar-response.dto';
import { CalendarUpdateRequestDTO } from '../models/calendar/calendar-update-request.dto';
import { CalendarUpdateResponseDTO } from '../models/calendar/calendar-update-response.dto';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private http = inject(HttpClient);
  private baseURL = 'http://localhost:8080/api/v1';

  // Create calendar
  createCalendar(data: CalendarCreateRequestDTO): Observable<CalendarResponseDTO> {
    return this.http.post<CalendarResponseDTO>(`${this.baseURL}/calendar`, data);
  }

  // Update calendar
  updateCalendar(calendarId: string, data: CalendarUpdateRequestDTO): Observable<CalendarUpdateResponseDTO> {
    return this.http.patch<CalendarUpdateResponseDTO>(`${this.baseURL}/calendar/${calendarId}`, data);
  }

  // Delete calendar
  deleteCalendar(calendarId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}/calendar/${calendarId}`);
  }

  // Get calendar homepage (all calendars + tags)
  getCalendarHomepage(): Observable<CalendarHomepageResponseDTO> {
    return this.http.get<CalendarHomepageResponseDTO>(`${this.baseURL}/calendar`);
  }

  // Filter events by calendar IDs
  getEventsByCalendarIds(calendarIds: string[]): Observable<CalendarFilterResponseDTO> {
    const ids = calendarIds.join(',');
    return this.http.get<CalendarFilterResponseDTO>(`${this.baseURL}/calendar?calendarIds=${ids}`);
  }

  // Filter events by event IDs
  getEventsByEventIds(eventIds: string[]): Observable<EventFilterResponseDTO> {
    const ids = eventIds.join(',');
    return this.http.get<EventFilterResponseDTO>(`${this.baseURL}/calendar?eventIds=${ids}`);
  }

  // Filter events by tags
  getEventsByTags(tags: string[]): Observable<EventFilterResponseDTO> {
    const tagList = tags.join(',');
    return this.http.get<EventFilterResponseDTO>(`${this.baseURL}/calendar?tags=${tagList}`);
  }

  // Generate invite link
  generateInvite(calendarId: string): Observable<CalendarInviteResponseDTO> {
    return this.http.get<CalendarInviteResponseDTO>(`${this.baseURL}/calendars/${calendarId}/invite`);
  }

  // Accept calendar invite
  acceptInvite(inviteToken: string): Observable<CalendarInviteAcceptResponseDTO> {
    return this.http.post<CalendarInviteAcceptResponseDTO>(
      `${this.baseURL}/calendars/invite/accept`,
      { invite_token: inviteToken }
    );
  }
}
```

#### Step 5: Use in Component
```typescript
import { Component, inject } from '@angular/core';
import { CalendarService } from '../../shared/services/calendar.service';

@Component({
  selector: 'app-create-calendar',
  standalone: true,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="calendarName" placeholder="Calendar Name">
      <button type="submit">Create Calendar</button>
    </form>
  `
})
export class CreateCalendarComponent {
  private calendarService = inject(CalendarService);
  
  calendarName = '';

  onSubmit() {
    this.calendarService.createCalendar({ name: this.calendarName }).subscribe({
      next: (response) => {
        console.log('Calendar created:', response);
        // Handle success (navigate, show message, etc.)
      },
      error: (err) => {
        console.error('Error creating calendar:', err);
        // Handle error (show error message)
      }
    });
  }
}
```

---

## 📊 All Available Endpoints

### 👤 User Endpoints
```
POST   /api/v1/users           # Register (no auth required)
POST   /api/v1/login           # Login (no auth required)
GET    /api/v1/users/{id}      # Get user by ID (auth required)
```

### 📅 Calendar Endpoints
```
# Main Calendar Operations
POST   /api/v1/calendar                           # Create calendar
PATCH  /api/v1/calendar/{calendar_id}             # Update calendar
DELETE /api/v1/calendar/{calendar_id}             # Delete calendar

# Calendar Homepage & Filtering (GET /api/v1/calendar with different query params)
GET    /api/v1/calendar                           # Get all calendars + tags (homepage)
GET    /api/v1/calendar?calendarIds=id1,id2       # Filter events by calendar IDs
GET    /api/v1/calendar?eventIds=id1,id2          # Filter events by event IDs
GET    /api/v1/calendar?tags=tag1,tag2            # Filter events by tags

# Calendar Invites
GET    /api/v1/calendars/{calendar_id}/invite     # Generate invite link
POST   /api/v1/calendars/invite/accept            # Accept calendar invite
```

### 🎯 Event Endpoints
```
POST   /api/v1/events          # Create event
PATCH  /api/v1/events/{id}     # Update event
DELETE /api/v1/events/{id}     # Delete event
```

---

## 🔑 Important Rules

### 1. **JWT Authentication**
- All endpoints (except `/users` and `/login`) require JWT
- Store token after login: `localStorage.setItem('token', response.token)`
- Interceptor automatically adds it to headers
- If you get 401 errors, check if token is stored

### 2. **Field Naming Convention**
- **Backend JSON uses snake_case:** `user_id`, `calendar_id`, `start_time`
- **Frontend DTOs must match exactly:** 
  ```typescript
  user_id: string;      // ✅ Correct
  userId: string;       // ❌ Wrong - won't map!
  ```

### 3. **Request Bodies**
- **DO NOT include `user_id` in request bodies!** Backend gets user from JWT
- Example:
  ```typescript
  // ❌ WRONG - Don't send user_id
  createCalendar({ user_id: '123', name: 'My Calendar' })
  
  // ✅ CORRECT - Only send required data
  createCalendar({ name: 'My Calendar' })
  ```

### 4. **Error Handling**
Always handle errors in your subscribe:
```typescript
this.service.method(data).subscribe({
  next: (response) => {
    // Handle success
  },
  error: (err) => {
    if (err.status === 401) {
      // Unauthorized - redirect to login
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      // Forbidden - show error message
      console.error('You do not have permission');
    } else {
      console.error('Error:', err);
    }
  }
});
```

---

## 🛠️ Testing Your Integration

### 1. **Test Backend is Running**
Open browser: `http://localhost:8080/api/v1/` (should show 401 or error page, not connection refused)

### 2. **Test Login Flow**
```typescript
// Try this in browser console or component:
localStorage.getItem('token')  // Should show JWT after login
```

### 3. **Check Network Tab**
- Open browser DevTools → Network tab
- Make a request
- Check request headers: Should have `Authorization: Bearer <token>`
- Check response: Should show data or proper error code

### 4. **Common Issues**

**Problem:** "401 Unauthorized" on all requests  
**Solution:** Check if token is stored: `localStorage.getItem('token')`

**Problem:** "CORS error"  
**Solution:** Backend is configured for `http://localhost:4200` - make sure frontend runs on that port

**Problem:** "Field X is null/undefined"  
**Solution:** Check DTO field names - must match backend exactly (snake_case!)

**Problem:** "Cannot read property of undefined"  
**Solution:** Initialize your DTOs properly or add null checks

---

## 📝 Quick Checklist for Adding New Features

- [ ] Find backend controller and endpoints
- [ ] Look at backend DTOs for request/response structure
- [ ] Create matching frontend DTOs (snake_case fields!)
- [ ] Create or update service with methods
- [ ] Inject service in component
- [ ] Call service method in component
- [ ] Handle success and error cases
- [ ] Test in browser with Network tab open

---

## 💡 Pro Tips

1. **Use browser DevTools Network tab** - See exactly what data is being sent/received
2. **Check backend console** - See backend errors and stack traces
3. **Copy-paste DTO structure** - Look at backend Java DTOs and convert to TypeScript
4. **Test endpoints with Postman first** - Verify backend works before integrating
5. **Use `localStorage.getItem('token')` in console** - Debug auth issues
6. **Observable pattern** - Always subscribe to HTTP calls, they don't execute otherwise!

---

## 📚 Resources

- **Backend API**: `http://localhost:8080/api/v1`
- **Backend Controllers**: `back-end/src/main/java/com/example/calendario/controller/`
- **Backend DTOs**: `back-end/src/main/java/com/example/calendario/dto/`
- **Frontend Services**: `front-end/src/app/shared/services/`
- **Frontend Models**: `front-end/src/app/shared/models/`

---

## 🚨 Need Help?

If you get stuck:
1. Check the Network tab in browser DevTools
2. Check backend console for errors
3. Verify DTO field names match exactly (snake_case!)
4. Make sure JWT token is stored after login
5. Ask the backend team for help!

---

**Good luck! You've got all the patterns to follow. Just copy the User service pattern for any new features!** 🚀
