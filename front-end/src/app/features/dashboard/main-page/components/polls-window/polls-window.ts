import { Component, inject, signal, output, input, computed } from '@angular/core';
import { PollDTO } from '../../../../../shared/models/polls/poll.dto';
import { CommonModule } from '@angular/common';

type PollStatus = 'all' | 'in-progress' | 'completed';

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
  selectedPollId = input<string | null>(null); // Track which poll is currently being viewed

  // Outputs to parent
  createPoll = output<void>();
  viewPolls = output<void>();
  viewPoll = output<string>();

  // Filter state
  selectedStatus = signal<PollStatus>('all');

  // Computed: filter and sort polls
  filteredPolls = computed(() => {
    const now = new Date();
    let filtered = this.polls();

    // Filter by status
    const status = this.selectedStatus();
    if (status === 'in-progress') {
      filtered = filtered.filter(p => new Date(p.end_time) > now);
    } else if (status === 'completed') {
      filtered = filtered.filter(p => new Date(p.end_time) <= now);
    }

    // Sort by end_time (soonest to end first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.end_time).getTime();
      const dateB = new Date(b.end_time).getTime();
      return dateA - dateB; // Ascending order - soonest first
    });
  });

  // Computed: count polls by status
  inProgressCount = computed(() => {
    const now = new Date();
    return this.polls().filter(p => new Date(p.end_time) > now).length;
  });

  completedCount = computed(() => {
    const now = new Date();
    return this.polls().filter(p => new Date(p.end_time) <= now).length;
  });

  onCreatePoll(): void {
    this.createPoll.emit();
  }

  onViewPolls(): void {
    this.viewPolls.emit();
  }

  onViewPoll(p: PollDTO): void {
    this.viewPoll.emit(p.poll_id);
  }

  setStatusFilter(status: PollStatus): void {
    this.selectedStatus.set(status);
  }

  formatPollTime(iso: string): string {
    if (!iso) return '';

    // Backend sends local datetime without timezone info
    // Parse directly without timezone conversion
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes} ${ampm}`;
    
    return `${date} ${time}`;
  }
}
