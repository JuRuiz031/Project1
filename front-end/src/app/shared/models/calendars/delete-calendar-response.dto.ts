/**
 * Response body for DELETE /calendar/{calendar_id}
 */
export interface DeleteCalendarResponseDTO {
  calendar_id: string;
  deleted: boolean;
}
