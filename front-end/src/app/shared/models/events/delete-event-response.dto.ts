/**
 * Response body for:
 * DELETE /api/v1/events/{event_id}
 */
export interface DeleteEventResponseDTO {
  event_id: string;
  calendar_id: string;
  deleted: boolean;
}
