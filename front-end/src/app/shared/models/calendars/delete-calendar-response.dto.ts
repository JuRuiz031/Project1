/**
 * Response body for DELETE /calendar/{calendar_id}
 */
export interface DeleteCalendarResponseDTO {
  calendar_id: number;
  deleted: boolean;
}
