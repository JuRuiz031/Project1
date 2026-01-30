import { Component, inject, signal, output, input, computed } from '@angular/core';
import { PollDTO } from '../../../../../shared/models/polls/poll.dto';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-polls-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './polls-window.html',
  styleUrls: ['./polls-window.css'],
})
export class PollsWindow {
  // Inputs from parent
  polls = input<PollDTO[]>([]);

  // Outputs to parent
  createPoll = output<void>();
  viewPolls = output<void>();
  viewPoll = output<string>();

  // Local state
  selectedPollId = signal('');

  // Computed: auto-select first poll when polls change
  firstPollId = computed(() => {
    const pollList = this.polls();
    if (pollList.length > 0 && !this.selectedPollId()) {
      return pollList[0].poll_id;
    }
    return this.selectedPollId();
  });

  onCreatePoll(): void {
    this.createPoll.emit();
  }

  onViewPolls(): void {
    this.viewPolls.emit();
  }

  onSelectPoll(p: PollDTO): void {
    this.selectedPollId.set(p.poll_id);
  }

  onDoubleClickPoll(p: PollDTO): void {
    this.selectedPollId.set(p.poll_id);
    this.viewPoll.emit(p.poll_id);
  }

  formatPollTime(iso: string): string {
    if (!iso) return '';

    const d = this.parseServerInstant(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    return `${date} ${time}`;
  }

    private parseServerInstant(iso: string): Date {
    const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(iso);
    return new Date(hasTz ? iso : `${iso}Z`);
  }

  getTimezoneAbbr(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value ?? 'UTC';
  }
}
