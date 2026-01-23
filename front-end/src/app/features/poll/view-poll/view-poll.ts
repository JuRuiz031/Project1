import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type PollViewModel = {
  pollId: string;
  calendarName: string;
  title: string;
  startDate: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endDate: string;
  endTime: string;
  tags: string[];
  options: string[];
  sharingLink: string;
};

@Component({
  selector: 'app-view-poll',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-poll.html',
  styleUrls: ['./view-poll.css'],
})
export class ViewPoll implements OnInit {
  apiError = '';

  // Later you can set this from route param
  pollId = 'demo-poll-1';

  poll!: PollViewModel;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO later: PollApiService.getPollById(this.pollId)

    // Mock data (so UI works now)
    this.poll = {
      pollId: this.pollId,
      calendarName: 'My Admin Calendar',
      title: 'Where should we eat?',
      startDate: '2026-01-22',
      startTime: '18:00',
      endDate: '2026-01-23',
      endTime: '18:00',
      tags: ['food', 'team', 'friday'],
      options: ['Tacos', 'Pizza', 'Sushi', 'Burgers'],
      sharingLink: `https://yourapp/polls/${this.pollId}`,
    };
  }

  goToEdit(): void {
    // For now (no :id route yet)
    this.router.navigate(['/edit-poll']);

    // Later:
    // this.router.navigate(['/edit-poll', this.pollId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/main-page']);
  }

  copyLink(): void {
    const text = this.poll?.sharingLink ?? '';
    if (!text) return;

    // modern clipboard (works in most browsers)
    navigator.clipboard?.writeText(text).catch(() => {
      // fallback: ignore
    });
  }
}
