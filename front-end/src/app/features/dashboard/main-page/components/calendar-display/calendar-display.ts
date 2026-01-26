import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarEvent } from 'angular-calendar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CalendarWidget } from './calendar-widget/calendar-widget';
import { CalendarService } from '../../../../../shared/services/calendar.service';

import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, finalize } from 'rxjs/operators';

type EventDTO = {
  event_id: string;
  calendar_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  notes?: string;
  tags: string[];
};

@Component({
  selector: 'app-calendar-display',
  standalone: true,
  imports: [CommonModule, RouterLink, CalendarWidget],
  templateUrl: './calendar-display.html',
  styleUrl: './calendar-display.css',
})
export class CalendarDisplay {
  viewDate = new Date();

  // UI state
  loading = false;
  errorMessage = '';

  // Widget consumes this
  events: CalendarEvent[] = [];

  private readonly calendarService = inject(CalendarService);
  private readonly destroyRef = inject(DestroyRef);

  // internal stream of inputs
  private readonly selectedCalendarIds$ = new Subject<string[]>();

  @Input() set selectedCalendarIds(value: string[]) {
    // Defer emission to next microtask so we avoid NG0100 timing weirdness
    queueMicrotask(() => this.selectedCalendarIds$.next(value ?? []));
  }

  constructor() {
    this.selectedCalendarIds$
      .pipe(
        // collapse rapid successive changes during init
        debounceTime(0),

        // only refetch if the set of ids actually changes
        map((ids) => (ids ?? []).filter(Boolean)),
        distinctUntilChanged((a, b) => a.join('|') === b.join('|')),

        switchMap((ids) => {
          this.errorMessage = '';

          if (ids.length === 0) {
            // clear widget when nothing selected
            this.events = [];
            return of(null);
          }

          this.loading = true;
          return this.calendarService.getFiltered({ calendarIds: ids }).pipe(
            catchError((err: unknown) => {
              console.error('CalendarDisplay.getFiltered failed', err);
              this.errorMessage = 'Failed to load events.';
              this.events = [];
              return of(null);
            }),
            finalize(() => {
              this.loading = false;
            })
          );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((dto) => {
        if (!dto) return;

        // Adjust property names if your CalendarFilterResponseDTO differs
        const apiEvents = (dto as any).events as EventDTO[] | undefined;

        this.events = (apiEvents ?? []).map((e) => {
          const color = calendarIdToColor(e.calendar_id);

          return {
            title: e.title,
            start: new Date(e.start_time),
            end: new Date(e.end_time),
            allDay: false,

            // angular-calendar supports this "color" field
            color,

            meta: {
              id: e.event_id,
              calendarId: e.calendar_id,
              description: e.description ?? '',
              notes: e.notes ?? '',
              tags: e.tags ?? [],
              color,
            } satisfies EventMeta,
          } as CalendarEvent;
        });
      });
  }

  onEventClicked(event: CalendarEvent) {
    console.log('Clicked event:', event.meta?.id, event);
  }
}

type EventMeta = {
  id: string;
  calendarId: string;
  description: string;
  notes: string;
  tags: string[];
  color: { primary: string; secondary: string };
};

function hashToHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h} ${s}% ${l}%)`;
}

function calendarIdToColor(calendarId: string) {
  const hue = hashToHue(calendarId);
  return {
    primary: hsl(hue, 70, 40),
    secondary: hsl(hue, 70, 92),
  };
}
