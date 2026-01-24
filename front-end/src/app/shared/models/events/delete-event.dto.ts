/**
 * Request body for DELETE /events/{id}
 * Your spec includes a body on delete.
 */
export interface DeleteEventDTO {
  user_id: number;
  calendar_id: number;
}
