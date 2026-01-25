/**
 * Response body for:
 * - POST /api/v1/users
 * - GET  /api/v1/users/{id}
 * - PATCH /api/v1/users/{id}
 *
 * Note:
 * - `email` is returned on create/update/view-user per Endpoints.md.
 * - `calendars` is returned on view-user (GET /users/{id}).
 */
export interface UserResponseDTO {
  user_id: string;
  username: string;
  email?: string;

  calendars?: Array<{
    calendar_id: string;
    name: string;
  }>;
}
