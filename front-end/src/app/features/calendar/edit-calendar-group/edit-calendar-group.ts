import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type CalendarUser = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

@Component({
  selector: 'app-edit-calendar-group',
  imports: [CommonModule, RouterLink],
  templateUrl: './edit-calendar-group.html',
  styleUrls: ['./edit-calendar-group.css'],
})
export class EditCalendarGroup implements OnInit {
  // UI state
  apiError = '';
  showDeleteConfirm = false;

  // Group fields
  groupId = 'demo-group-1'; // später aus route param
  groupName = 'name field';
  inviteLink = 'Link Field';

  // Users list
  users: CalendarUser[] = [];
  selectedUserId: string | null = null;

  ngOnInit(): void {
    // TODO: API call -> calendarGroupApi.getGroup(groupId), getUsers(groupId), getInviteLink(groupId)

    // Mock Users (damit du UI sofort testen kannst)
    this.users = [
      { id: 'u1', username: 'Sean', email: 'sean@example.com', isAdmin: true },
      { id: 'u2', username: 'Alice', email: 'alice@example.com', isAdmin: false },
      { id: 'u3', username: 'Bob', email: 'bob@example.com', isAdmin: false },
    ];
  }

  selectUser(userId: string) {
    this.selectedUserId = userId;
  }

  generateLink() {
    // TODO: API call -> calendarGroupApi.generateInviteLink(groupId)
    // Mock: random token
    const token = Math.random().toString(36).slice(2, 10);
    this.inviteLink = `https://yourapp/join/${this.groupId}?t=${token}`;
  }

  promoteSelectedToAdmin() {
    this.apiError = '';
    if (!this.selectedUserId) return;

    // TODO: API call -> calendarGroupApi.promoteUser(groupId, selectedUserId)
    this.users = this.users.map(u =>
      u.id === this.selectedUserId ? { ...u, isAdmin: true } : u
    );
  }

  removeSelectedUser() {
    this.apiError = '';
    if (!this.selectedUserId) return;

    // TODO: API call -> calendarGroupApi.removeUser(groupId, selectedUserId)
    this.users = this.users.filter(u => u.id !== this.selectedUserId);
    this.selectedUserId = null;
  }

  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
  }

  confirmDeleteCalendarGroup() {
    this.apiError = '';
    this.showDeleteConfirm = false;

    // TODO: API call -> calendarGroupApi.deleteGroup(groupId)
    // danach navigate -> z.B. /dashboard oder /calendar-groups
    console.log('Deleting calendar group:', this.groupId);
  }

  get selectedUserIsAdmin(): boolean {
    if (!this.selectedUserId) return false;
    return this.users.some(u => u.id === this.selectedUserId && u.isAdmin);
  }

  demoteSelectedToMember() {
    this.apiError = '';
    if (!this.selectedUserId) return;

    // TODO: API call -> calendarGroupApi.demoteUser(groupId, selectedUserId)
    this.users = this.users.map(u =>
      u.id === this.selectedUserId ? { ...u, isAdmin: false } : u
    );
  }
}
