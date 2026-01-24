/**
 * Response body for:
 * DELETE /api/v1/events/{event_id}
 */
export interface DeleteEventResponseDTO {
  event_id: number;
  calendar_id: number;
  deleted: boolean;
}
