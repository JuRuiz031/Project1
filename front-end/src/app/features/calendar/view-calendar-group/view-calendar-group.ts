import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-view-calendar-group',
  // standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-calendar-group.html',
  styleUrls: ['./view-calendar-group.css'],
})
export class ViewCalendarGroup implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  groupId = '';
  groupName = 'Calendar Name';
  inviteLink = '';
  apiError = '';

  ngOnInit(): void {
    // ✅ Recommended: /view-calendar-group/:id
    this.groupId = this.route.snapshot.paramMap.get('id') ?? 'demo-group-1';

    // TODO: später API call: load group name + link by groupId
    // Mock:
    this.groupName = 'My Calendar Group';
    this.inviteLink = '';
  }

  generateLink(): void {
    this.apiError = '';

    // TODO: später API call: calendarGroupApi.generateInviteLink(this.groupId)

    // Mock link generation:
    const token = Math.random().toString(36).slice(2, 10);
    this.inviteLink = `https://yourapp/join/${this.groupId}?t=${token}`;
  }

  cancel(): void {
    this.router.navigateByUrl('/main-page');
  }
}
