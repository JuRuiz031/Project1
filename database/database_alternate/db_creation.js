// db_creation.js
// Usage (in mongosh):
//   load("C:/absolute/path/to/db_creation.js")
//
// IMPORTANT: Update the require() path below to point to your db_connection.js file.
const { connection } = require(
  `E:/Documents/Ben/Work/Revature/Projects/Project 1 - Calendar App/Github/Project1/database/database_alternate/db_connection.js`
);

db = connect(connection);

/**
 * MongoDB Database Creation Script for Calendario
 *
 * This script creates sample data matching the current backend schema.
 * Run with (mongosh):
 *   load("C:/absolute/path/to/db_creation.js")
 *
 * Schema version: 2026-01-26
 */

// =================================================
// Helper to generate UUID tokens for invite links
// =================================================
function generateToken() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =================================================
// WIPE EVERYTHING in the connected database
// =================================================
print("dropping database (wipe all existing data)...");
db.dropDatabase();
print("dropped database");

// =================================================
// CALENDARS (data from your newer schema)
// =================================================
print("adding calendars");
db.createCollection("calendars");

const now = new Date();
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

db.calendars.insertMany([
  {
    name: "Work",
    invites: [{ link: generateToken(), expiresAt: oneWeekLater }],
    createdAt: now,
    updatedAt: now,
  },
  { name: "Personal", invites: [], createdAt: now, updatedAt: now },
  {
    name: "Family",
    invites: [{ link: generateToken(), expiresAt: oneWeekLater }],
    createdAt: now,
    updatedAt: now,
  },
  { name: "Fitness", invites: [], createdAt: now, updatedAt: now },
  { name: "Travel", invites: [], createdAt: now, updatedAt: now },
  { name: "School", invites: [], createdAt: now, updatedAt: now },
  {
    name: "Project Alpha",
    invites: [{ link: generateToken(), expiresAt: oneWeekLater }],
    createdAt: now,
    updatedAt: now,
  },
  { name: "Meetings", invites: [], createdAt: now, updatedAt: now },
  { name: "Deadlines", invites: [], createdAt: now, updatedAt: now },
  { name: "Holidays", invites: [], createdAt: now, updatedAt: now },
]);
print("added calendars");

const calendarIds = db.calendars
  .find({}, { _id: 1 })
  .toArray()
  .map((c) => c._id);

// =================================================
// USERS (data from your newer schema)
// =================================================
print("adding users");
db.createCollection("users");

// Create unique indexes (same as your newer script)
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.users.insertMany([
  {
    username: "alice_w",
    email: "alice.w@example.com",
    password: "password123",
    isSuperuser: true,
    calendarIds: [
      { calendarId: calendarIds[0].toString(), isAdmin: true }, // Work - admin
      { calendarId: calendarIds[1].toString(), isAdmin: false }, // Personal - member
    ],
  },
  {
    username: "bob_smith",
    email: "bob.smith@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [{ calendarId: calendarIds[2].toString(), isAdmin: true }], // Family - admin
  },
  {
    username: "charlie_k",
    email: "charlie.k@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [
      { calendarId: calendarIds[3].toString(), isAdmin: true }, // Fitness - admin
      { calendarId: calendarIds[4].toString(), isAdmin: false }, // Travel - member
    ],
  },
  {
    username: "diana_p",
    email: "diana.p@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [], // No calendars yet
  },
  {
    username: "ethan_r",
    email: "ethan.r@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [{ calendarId: calendarIds[5].toString(), isAdmin: true }], // School - admin
  },
  {
    username: "fiona_l",
    email: "fiona.l@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [
      { calendarId: calendarIds[6].toString(), isAdmin: true }, // Project Alpha - admin
      { calendarId: calendarIds[7].toString(), isAdmin: false }, // Meetings - member
    ],
  },
  {
    username: "george_m",
    email: "george.m@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [{ calendarId: calendarIds[8].toString(), isAdmin: true }], // Deadlines - admin
  },
  {
    username: "hannah_t",
    email: "hannah.t@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [{ calendarId: calendarIds[9].toString(), isAdmin: true }], // Holidays - admin
  },
  {
    username: "ivan_d",
    email: "ivan.d@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [], // No calendars
  },
  {
    username: "julia_n",
    email: "julia.n@example.com",
    password: "password123",
    isSuperuser: false,
    calendarIds: [{ calendarId: calendarIds[0].toString(), isAdmin: false }], // Work - member (not admin)
  },
]);
print("added users");

const userIds = db.users
  .find({}, { _id: 1 })
  .toArray()
  .map((u) => u._id);

// =================================================
// EVENTS (data from your newer schema)
// =================================================
print("adding events");
db.createCollection("events");

const eventNow = new Date();
const eventOneWeekLater = new Date(
  eventNow.getTime() + 7 * 24 * 60 * 60 * 1000
);

db.events.insertMany([
  {
    calendarId: calendarIds[0].toString(),
    title: "Team Standup",
    startTime: new Date("2026-02-01T09:00:00Z"),
    endTime: new Date("2026-02-01T09:30:00Z"),
    description: "Daily standup meeting for the development team",
    notes: "Zoom link: https://zoom.us/j/123456789",
    tags: ["work", "meeting", "daily"],
    inviteLinks: [
      { token: generateToken(), createdAt: eventNow, expiresAt: eventOneWeekLater },
    ],
  },
  {
    calendarId: calendarIds[0].toString(),
    title: "Sprint Planning",
    startTime: new Date("2026-02-02T10:00:00Z"),
    endTime: new Date("2026-02-02T11:30:00Z"),
    description: "Planning session for Sprint 14",
    notes: "Bring your backlog items prepared",
    tags: ["work", "planning", "sprint"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[1].toString(),
    title: "Doctor Appointment",
    startTime: new Date("2026-02-03T15:00:00Z"),
    endTime: new Date("2026-02-03T16:00:00Z"),
    description: "Annual checkup with Dr. Smith",
    notes: "Bring insurance card",
    tags: ["personal", "health"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[2].toString(),
    title: "Family Dinner",
    startTime: new Date("2026-02-04T18:00:00Z"),
    endTime: new Date("2026-02-04T20:00:00Z"),
    description: "Monthly family dinner at grandma's house",
    notes: "Bring dessert",
    tags: ["family", "dinner"],
    inviteLinks: [
      { token: generateToken(), createdAt: eventNow, expiresAt: eventOneWeekLater },
    ],
  },
  {
    calendarId: calendarIds[3].toString(),
    title: "Gym Session",
    startTime: new Date("2026-02-05T07:00:00Z"),
    endTime: new Date("2026-02-05T08:00:00Z"),
    description: "Morning workout - leg day",
    notes: "",
    tags: ["fitness", "gym"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[4].toString(),
    title: "Flight to NYC",
    startTime: new Date("2026-02-06T12:00:00Z"),
    endTime: new Date("2026-02-06T16:00:00Z"),
    description: "United Airlines UA123",
    notes: "Confirmation: ABC123. Terminal 2.",
    tags: ["travel", "flight"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[5].toString(),
    title: "Final Exam - Calculus",
    startTime: new Date("2026-02-07T13:00:00Z"),
    endTime: new Date("2026-02-07T15:00:00Z"),
    description: "Calculus II Final Examination",
    notes: "Room 301, bring calculator",
    tags: ["school", "exam"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[6].toString(),
    title: "Project Alpha Demo",
    startTime: new Date("2026-02-08T14:00:00Z"),
    endTime: new Date("2026-02-08T15:00:00Z"),
    description: "Demo presentation for stakeholders",
    notes: "Prepare slides and live demo environment",
    tags: ["work", "project", "demo"],
    inviteLinks: [
      { token: generateToken(), createdAt: eventNow, expiresAt: eventOneWeekLater },
    ],
  },
  {
    calendarId: calendarIds[7].toString(),
    title: "Weekly Sync",
    startTime: new Date("2026-02-09T11:00:00Z"),
    endTime: new Date("2026-02-09T11:30:00Z"),
    description: "Cross-team synchronization meeting",
    notes: "",
    tags: ["meeting", "sync"],
    inviteLinks: [],
  },
  {
    calendarId: calendarIds[8].toString(),
    title: "Release Deadline",
    startTime: new Date("2026-02-10T17:00:00Z"),
    endTime: new Date("2026-02-10T18:00:00Z"),
    description: "v2.0 release deadline",
    notes: "All features must be merged by 5 PM",
    tags: ["deadline", "work", "release"],
    inviteLinks: [],
  },
]);
print("added events");

const eventIds = db.events
  .find({}, { _id: 1 })
  .toArray()
  .map((e) => e._id);

// =================================================
// POLLS (data from your newer schema)
// =================================================
print("adding polls");
db.createCollection("polls");

const pollNow = new Date();
const pollOneWeekLater = new Date(pollNow.getTime() + 7 * 24 * 60 * 60 * 1000);

db.polls.insertMany([
  {
    calendarId: calendarIds[0].toString(),
    title: "Best time for weekly standup",
    description: "Vote on the best time for our weekly team standup meeting.",
    notes: "Please consider your recurring conflicts.",
    startTime: new Date("2026-02-01T00:00:00Z"),
    endTime: new Date("2026-02-03T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: false,
    tags: ["work", "meeting", "scheduling"],
    inviteLinks: [
      { token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater },
    ],
    options: {
      "0": {
        optionId: 0,
        description: "Monday 9:00 AM",
        userVotes: [userIds[0].toString(), userIds[1].toString()],
        guestVotes: ["Alice (guest)"],
      },
      "1": {
        optionId: 1,
        description: "Tuesday 10:00 AM",
        userVotes: [userIds[2].toString()],
        guestVotes: [],
      },
      "2": {
        optionId: 2,
        description: "Wednesday 9:30 AM",
        userVotes: [],
        guestVotes: [],
      },
    },
  },
  {
    calendarId: calendarIds[1].toString(),
    title: "Choose team lunch location",
    description: "Help decide where we should go for the next team lunch.",
    notes: "",
    startTime: new Date("2026-02-05T00:00:00Z"),
    endTime: new Date("2026-02-07T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: true,
    tags: ["social", "food"],
    inviteLinks: [],
    options: {
      "0": {
        optionId: 0,
        description: "Italian Restaurant",
        userVotes: [userIds[0].toString()],
        guestVotes: ["Bob"],
      },
      "1": {
        optionId: 1,
        description: "Sushi Place",
        userVotes: [userIds[1].toString(), userIds[3].toString()],
        guestVotes: [],
      },
      "2": {
        optionId: 2,
        description: "Mexican Grill",
        userVotes: [userIds[2].toString()],
        guestVotes: ["Guest123"],
      },
    },
  },
  {
    calendarId: calendarIds[6].toString(), // Project Alpha (matches your newer script)
    title: "Select project deadline",
    description: "Finalize the deadline for Project Alpha.",
    notes: "Deadline impacts release planning and resource allocation.",
    startTime: new Date("2026-02-08T00:00:00Z"),
    endTime: new Date("2026-02-10T23:59:59Z"),
    resultsVisible: false,
    allowMultipleVotes: false,
    tags: ["project", "deadline", "planning"],
    inviteLinks: [
      { token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater },
    ],
    options: {
      "0": {
        optionId: 0,
        description: "February 20",
        userVotes: [userIds[2].toString()],
        guestVotes: [],
      },
      "1": {
        optionId: 1,
        description: "February 27",
        userVotes: [userIds[0].toString(), userIds[3].toString()],
        guestVotes: ["Charlie"],
      },
    },
  },
  {
    calendarId: calendarIds[3].toString(),
    title: "Pick fitness class",
    description: "Vote on which fitness class to attend this month.",
    notes: "Classes are held every Saturday morning.",
    startTime: new Date("2026-02-11T00:00:00Z"),
    endTime: new Date("2026-02-13T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: true,
    tags: ["fitness", "class"],
    inviteLinks: [],
    options: {
      "0": {
        optionId: 0,
        description: "Yoga",
        userVotes: [userIds[1].toString()],
        guestVotes: [],
      },
      "1": {
        optionId: 1,
        description: "Spin Class",
        userVotes: [userIds[2].toString()],
        guestVotes: ["Dana"],
      },
      "2": {
        optionId: 2,
        description: "HIIT Training",
        userVotes: [userIds[0].toString(), userIds[4].toString()],
        guestVotes: [],
      },
    },
  },
]);
print("added polls");

// =================================================
// SUMMARY (same idea as your newer script)
// =================================================
print("\n========== Database Setup Complete ==========");
print("Collections created:");
print("  - calendars: " + db.calendars.countDocuments() + " documents");
print("  - users: " + db.users.countDocuments() + " documents");
print("  - events: " + db.events.countDocuments() + " documents");
print("  - polls: " + db.polls.countDocuments() + " documents");
print("\nTest accounts (all use password: 'password123'):");
print("  - alice_w (superuser, admin of Work calendar)");
print("  - bob_smith (admin of Family calendar)");
print("  - julia_n (member of Work calendar, not admin)");
print("=============================================\n");

print("✅ database seeded successfully");
