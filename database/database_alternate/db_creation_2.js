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
 * Schema version: 2026-01-26 (seed updated)
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
// CALENDARS
// - More realistic: shared calendars + per-person calendars
// =================================================
print("adding calendars");
db.createCollection("calendars");

const now = new Date();
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const calendarSeed = [
  // Shared calendars
  { name: "Family", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },
  { name: "Friends & Social", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },
  { name: "Holidays & Travel", invites: [], createdAt: now, updatedAt: now },

  // Alice (Software Engineer, Rock Climbing)
  { name: "Alice - Work (Engineering)", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },
  { name: "Alice - Personal", invites: [], createdAt: now, updatedAt: now },
  { name: "Alice - Climbing", invites: [], createdAt: now, updatedAt: now },

  // Bob (Chef, Cycling)
  { name: "Bob - Restaurant Shifts", invites: [], createdAt: now, updatedAt: now },
  { name: "Bob - Cycling", invites: [], createdAt: now, updatedAt: now },
  { name: "Bob - Personal", invites: [], createdAt: now, updatedAt: now },

  // Charlie (Math Teacher, Gaming)
  { name: "Charlie - School (Teaching)", invites: [], createdAt: now, updatedAt: now },
  { name: "Charlie - Gaming Nights", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },
  { name: "Charlie - Personal", invites: [], createdAt: now, updatedAt: now },

  // Diana (Nurse, Yoga)
  { name: "Diana - Hospital Shifts", invites: [], createdAt: now, updatedAt: now },
  { name: "Diana - Yoga & Wellness", invites: [], createdAt: now, updatedAt: now },
  { name: "Diana - Personal", invites: [], createdAt: now, updatedAt: now },

  // Ethan (Project Manager, Photography)
  { name: "Ethan - Work (PM)", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },
  { name: "Ethan - Photography", invites: [], createdAt: now, updatedAt: now },
  { name: "Ethan - Personal", invites: [], createdAt: now, updatedAt: now },

  // Fiona (Designer, Running)
  { name: "Fiona - Work (Design)", invites: [], createdAt: now, updatedAt: now },
  { name: "Fiona - Running", invites: [], createdAt: now, updatedAt: now },
  { name: "Fiona - Personal", invites: [], createdAt: now, updatedAt: now },

  // George (Accountant, Woodworking)
  { name: "George - Work (Accounting)", invites: [], createdAt: now, updatedAt: now },
  { name: "George - Woodworking", invites: [], createdAt: now, updatedAt: now },
  { name: "George - Personal", invites: [], createdAt: now, updatedAt: now },

  // Hannah (Marketing, Salsa Dance)
  { name: "Hannah - Work (Marketing)", invites: [], createdAt: now, updatedAt: now },
  { name: "Hannah - Salsa", invites: [], createdAt: now, updatedAt: now },
  { name: "Hannah - Personal", invites: [], createdAt: now, updatedAt: now },

  // Ivan (Mechanic, Fishing)
  { name: "Ivan - Shop Schedule", invites: [], createdAt: now, updatedAt: now },
  { name: "Ivan - Fishing", invites: [], createdAt: now, updatedAt: now },
  { name: "Ivan - Personal", invites: [], createdAt: now, updatedAt: now },

  // Julia (Student, Piano)
  { name: "Julia - School (Student)", invites: [], createdAt: now, updatedAt: now },
  { name: "Julia - Piano Practice", invites: [], createdAt: now, updatedAt: now },
  { name: "Julia - Personal", invites: [], createdAt: now, updatedAt: now },
];

db.calendars.insertMany(calendarSeed);
print("added calendars");

// Build a map from calendar name -> id string
function getCalendarIdByName(name) {
  const doc = db.calendars.findOne({ name }, { _id: 1 });
  if (!doc) throw new Error(`Calendar not found: ${name}`);
  return doc._id.toString();
}

const CAL = {
  // Shared
  family: getCalendarIdByName("Family"),
  social: getCalendarIdByName("Friends & Social"),
  holidays: getCalendarIdByName("Holidays & Travel"),

  // Alice
  aliceWork: getCalendarIdByName("Alice - Work (Engineering)"),
  alicePersonal: getCalendarIdByName("Alice - Personal"),
  aliceClimbing: getCalendarIdByName("Alice - Climbing"),

  // Bob
  bobWork: getCalendarIdByName("Bob - Restaurant Shifts"),
  bobCycling: getCalendarIdByName("Bob - Cycling"),
  bobPersonal: getCalendarIdByName("Bob - Personal"),

  // Charlie
  charlieWork: getCalendarIdByName("Charlie - School (Teaching)"),
  charlieGaming: getCalendarIdByName("Charlie - Gaming Nights"),
  charliePersonal: getCalendarIdByName("Charlie - Personal"),

  // Diana
  dianaWork: getCalendarIdByName("Diana - Hospital Shifts"),
  dianaYoga: getCalendarIdByName("Diana - Yoga & Wellness"),
  dianaPersonal: getCalendarIdByName("Diana - Personal"),

  // Ethan
  ethanWork: getCalendarIdByName("Ethan - Work (PM)"),
  ethanPhoto: getCalendarIdByName("Ethan - Photography"),
  ethanPersonal: getCalendarIdByName("Ethan - Personal"),

  // Fiona
  fionaWork: getCalendarIdByName("Fiona - Work (Design)"),
  fionaRunning: getCalendarIdByName("Fiona - Running"),
  fionaPersonal: getCalendarIdByName("Fiona - Personal"),

  // George
  georgeWork: getCalendarIdByName("George - Work (Accounting)"),
  georgeWood: getCalendarIdByName("George - Woodworking"),
  georgePersonal: getCalendarIdByName("George - Personal"),

  // Hannah
  hannahWork: getCalendarIdByName("Hannah - Work (Marketing)"),
  hannahSalsa: getCalendarIdByName("Hannah - Salsa"),
  hannahPersonal: getCalendarIdByName("Hannah - Personal"),

  // Ivan
  ivanWork: getCalendarIdByName("Ivan - Shop Schedule"),
  ivanFishing: getCalendarIdByName("Ivan - Fishing"),
  ivanPersonal: getCalendarIdByName("Ivan - Personal"),

  // Julia
  juliaSchool: getCalendarIdByName("Julia - School (Student)"),
  juliaPiano: getCalendarIdByName("Julia - Piano Practice"),
  juliaPersonal: getCalendarIdByName("Julia - Personal"),
};

// =================================================
// USERS
// - First name only, capitalized
// - Password always: "password"
// - Each user has several calendars
// =================================================
print("adding users");
db.createCollection("users");

// Unique indexes (matching your newer schema expectations)
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.users.insertMany([
  {
    username: "Alice",
    email: "alice@example.com",
    password: "password",
    isSuperuser: true,
    // Job: Software Engineer | Hobby: Rock Climbing
    calendarIds: [
      { calendarId: CAL.aliceWork, isAdmin: true },
      { calendarId: CAL.alicePersonal, isAdmin: true },
      { calendarId: CAL.aliceClimbing, isAdmin: true },
      { calendarId: CAL.social, isAdmin: true }, // Alice manages the social calendar
      { calendarId: CAL.holidays, isAdmin: false },
      { calendarId: CAL.family, isAdmin: false },
    ],
  },
  {
    username: "Bob",
    email: "bob@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Chef | Hobby: Cycling
    calendarIds: [
      { calendarId: CAL.bobWork, isAdmin: true },
      { calendarId: CAL.bobCycling, isAdmin: true },
      { calendarId: CAL.bobPersonal, isAdmin: true },
      { calendarId: CAL.social, isAdmin: false },
      { calendarId: CAL.family, isAdmin: false },
      { calendarId: CAL.holidays, isAdmin: false },
    ],
  },
  {
    username: "Charlie",
    email: "charlie@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Math Teacher | Hobby: Gaming
    calendarIds: [
      { calendarId: CAL.charlieWork, isAdmin: true },
      { calendarId: CAL.charlieGaming, isAdmin: true },
      { calendarId: CAL.charliePersonal, isAdmin: true },
      { calendarId: CAL.social, isAdmin: false },
      { calendarId: CAL.family, isAdmin: false },
    ],
  },
  {
    username: "Diana",
    email: "diana@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Nurse | Hobby: Yoga
    calendarIds: [
      { calendarId: CAL.dianaWork, isAdmin: true },
      { calendarId: CAL.dianaYoga, isAdmin: true },
      { calendarId: CAL.dianaPersonal, isAdmin: true },
      { calendarId: CAL.family, isAdmin: false },
      { calendarId: CAL.social, isAdmin: false },
    ],
  },
  {
    username: "Ethan",
    email: "ethan@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Project Manager | Hobby: Photography
    calendarIds: [
      { calendarId: CAL.ethanWork, isAdmin: true },
      { calendarId: CAL.ethanPhoto, isAdmin: true },
      { calendarId: CAL.ethanPersonal, isAdmin: true },
      { calendarId: CAL.holidays, isAdmin: true }, // Ethan manages the holidays/travel calendar
      { calendarId: CAL.social, isAdmin: false },
    ],
  },
  {
    username: "Fiona",
    email: "fiona@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Designer | Hobby: Running
    calendarIds: [
      { calendarId: CAL.fionaWork, isAdmin: true },
      { calendarId: CAL.fionaRunning, isAdmin: true },
      { calendarId: CAL.fionaPersonal, isAdmin: true },
      { calendarId: CAL.social, isAdmin: false },
      { calendarId: CAL.holidays, isAdmin: false },
    ],
  },
  {
    username: "George",
    email: "george@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Accountant | Hobby: Woodworking
    calendarIds: [
      { calendarId: CAL.georgeWork, isAdmin: true },
      { calendarId: CAL.georgeWood, isAdmin: true },
      { calendarId: CAL.georgePersonal, isAdmin: true },
      { calendarId: CAL.family, isAdmin: false },
      { calendarId: CAL.holidays, isAdmin: false },
    ],
  },
  {
    username: "Hannah",
    email: "hannah@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Marketing | Hobby: Salsa
    calendarIds: [
      { calendarId: CAL.hannahWork, isAdmin: true },
      { calendarId: CAL.hannahSalsa, isAdmin: true },
      { calendarId: CAL.hannahPersonal, isAdmin: true },
      { calendarId: CAL.social, isAdmin: false },
      { calendarId: CAL.family, isAdmin: false },
    ],
  },
  {
    username: "Ivan",
    email: "ivan@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Mechanic | Hobby: Fishing
    calendarIds: [
      { calendarId: CAL.ivanWork, isAdmin: true },
      { calendarId: CAL.ivanFishing, isAdmin: true },
      { calendarId: CAL.ivanPersonal, isAdmin: true },
      { calendarId: CAL.holidays, isAdmin: false },
      { calendarId: CAL.social, isAdmin: false },
    ],
  },
  {
    username: "Julia",
    email: "julia@example.com",
    password: "password",
    isSuperuser: false,
    // Job: Student | Hobby: Piano
    calendarIds: [
      { calendarId: CAL.juliaSchool, isAdmin: true },
      { calendarId: CAL.juliaPiano, isAdmin: true },
      { calendarId: CAL.juliaPersonal, isAdmin: true },
      { calendarId: CAL.social, isAdmin: false },
      { calendarId: CAL.holidays, isAdmin: false },
    ],
  },
]);
print("added users");

// Grab user ids in a stable way (by username)
function getUserIdByUsername(username) {
  const doc = db.users.findOne({ username }, { _id: 1 });
  if (!doc) throw new Error(`User not found: ${username}`);
  return doc._id.toString();
}

const USER = {
  Alice: getUserIdByUsername("Alice"),
  Bob: getUserIdByUsername("Bob"),
  Charlie: getUserIdByUsername("Charlie"),
  Diana: getUserIdByUsername("Diana"),
  Ethan: getUserIdByUsername("Ethan"),
  Fiona: getUserIdByUsername("Fiona"),
  George: getUserIdByUsername("George"),
  Hannah: getUserIdByUsername("Hannah"),
  Ivan: getUserIdByUsername("Ivan"),
  Julia: getUserIdByUsername("Julia"),
};

// =================================================
// EVENTS
// Requirements you gave:
// - Mostly between 6am and 10pm
// - Some weekend social events can go until 12am (midnight)
// - Span ALL of Dec 2025, Jan 2026, Feb 2026
// =================================================
print("adding events");
db.createCollection("events");

const eventNow = new Date();
const eventOneWeekLater = new Date(eventNow.getTime() + 7 * 24 * 60 * 60 * 1000);

function ev(calendarId, title, startISO, endISO, description, tags, notes, includeInvite) {
  return {
    calendarId,
    title,
    startTime: new Date(startISO),
    endTime: new Date(endISO),
    description: description || "",
    notes: notes || "",
    tags: tags || [],
    inviteLinks: includeInvite
      ? [{ token: generateToken(), createdAt: eventNow, expiresAt: eventOneWeekLater }]
      : [],
  };
}

// NOTE: Times are stored as UTC ("Z") here.
// If your UI assumes local time, you may see offsets — but the dataset still follows your "6am–10pm mostly" rule in UTC terms.
db.events.insertMany([
  // -----------------------
  // DECEMBER 2025 (spread)
  // -----------------------

  // Alice (Engineering + Climbing)
  ev(CAL.aliceWork, "Sprint Planning", "2025-12-02T16:00:00Z", "2025-12-02T17:30:00Z", "Plan the sprint scope and confirm priorities.", ["work", "planning"], "Bring top backlog items + estimates.", false),
  ev(CAL.aliceWork, "Team Standup", "2025-12-03T15:00:00Z", "2025-12-03T15:15:00Z", "Daily engineering standup.", ["work", "meeting"], "Keep it short: blockers + next steps.", false),
  ev(CAL.aliceClimbing, "Climbing Gym", "2025-12-04T23:00:00Z", "2025-12-05T00:30:00Z", "Bouldering + technique drills.", ["climbing", "fitness"], "Focus: footwork + balance.", false),
  ev(CAL.alicePersonal, "Meal Prep", "2025-12-07T17:00:00Z", "2025-12-07T18:30:00Z", "Cook for the week.", ["personal", "routine"], "Plan quick lunches.", false),

  // Bob (Chef + Cycling)
  ev(CAL.bobWork, "Dinner Service", "2025-12-05T23:00:00Z", "2025-12-06T03:00:00Z", "Friday dinner rush at the restaurant.", ["work", "chef"], "Busy night—prep stations early.", false), // exception (late)
  ev(CAL.bobCycling, "Morning Ride", "2025-12-06T14:00:00Z", "2025-12-06T15:30:00Z", "Endurance ride around the lake.", ["cycling", "fitness"], "Aim: steady pace.", false),
  ev(CAL.bobPersonal, "Grocery Run", "2025-12-08T17:30:00Z", "2025-12-08T18:15:00Z", "Restock essentials.", ["personal"], "", false),

  // Charlie (Teacher + Gaming)
  ev(CAL.charlieWork, "Grade Papers", "2025-12-09T16:30:00Z", "2025-12-09T18:00:00Z", "Finish grading quizzes and update gradebook.", ["school", "admin"], "Target: finish Period 3 & 4.", false),
  ev(CAL.charlieWork, "Tutoring Hour", "2025-12-11T22:00:00Z", "2025-12-11T23:00:00Z", "After-school tutoring session.", ["school", "students"], "Bring practice problems.", false),
  ev(CAL.charlieGaming, "Board Game Night", "2025-12-13T02:00:00Z", "2025-12-13T06:00:00Z", "Friends game night (weekend).", ["social", "gaming"], "Snacks + a new co-op game.", true), // weekend late (goes to midnight+)

  // Diana (Nurse + Yoga)
  ev(CAL.dianaWork, "Hospital Shift", "2025-12-14T13:00:00Z", "2025-12-14T21:00:00Z", "Day shift on the floor.", ["work", "nurse"], "Bring extra scrubs.", false),
  ev(CAL.dianaYoga, "Yoga Class", "2025-12-16T00:00:00Z", "2025-12-16T01:00:00Z", "Evening flow class.", ["yoga", "wellness"], "Hydrate beforehand.", false),
  ev(CAL.dianaPersonal, "Doctor Appointment", "2025-12-18T16:00:00Z", "2025-12-18T16:45:00Z", "Routine check-in.", ["personal", "health"], "Bring insurance card.", false),

  // Ethan (PM + Photography)
  ev(CAL.ethanWork, "Stakeholder Sync", "2025-12-03T19:00:00Z", "2025-12-03T19:45:00Z", "Weekly stakeholder updates.", ["work", "meeting"], "Share risks + next milestones.", false),
  ev(CAL.ethanPhoto, "Sunset Photo Walk", "2025-12-20T22:30:00Z", "2025-12-20T23:45:00Z", "Golden hour street photography.", ["photography", "hobby"], "Bring prime lens.", false),
  ev(CAL.holidays, "Holiday Travel Planning", "2025-12-21T17:00:00Z", "2025-12-21T18:00:00Z", "Coordinate holiday travel and lodging.", ["travel", "planning"], "Compare lodging options + dates.", false),

  // Fiona (Designer + Running)
  ev(CAL.fionaWork, "Design Review", "2025-12-10T18:00:00Z", "2025-12-10T19:00:00Z", "Review UI flows with the team.", ["work", "design"], "Bring updated wireframes.", false),
  ev(CAL.fionaRunning, "Tempo Run", "2025-12-12T13:30:00Z", "2025-12-12T14:15:00Z", "Warmup + tempo intervals.", ["running", "fitness"], "Goal: maintain steady pace.", false),

  // George (Accounting + Woodworking)
  ev(CAL.georgeWork, "Month-End Close Prep", "2025-12-29T16:00:00Z", "2025-12-29T18:00:00Z", "Prepare reconciliation checklist.", ["work", "accounting"], "Double-check outstanding invoices.", false),
  ev(CAL.georgeWood, "Woodshop Session", "2025-12-27T17:00:00Z", "2025-12-27T19:30:00Z", "Build shelving project.", ["woodworking", "hobby"], "Measure twice, cut once.", false),

  // Hannah (Marketing + Salsa)
  ev(CAL.hannahWork, "Campaign Planning", "2025-12-08T16:00:00Z", "2025-12-08T17:30:00Z", "Plan Q1 content calendar.", ["work", "marketing"], "Pick themes + key dates.", false),
  ev(CAL.hannahSalsa, "Salsa Class", "2025-12-19T01:00:00Z", "2025-12-19T02:30:00Z", "Evening salsa class.", ["dance", "salsa"], "Practice turns.", false),

  // Ivan (Mechanic + Fishing)
  ev(CAL.ivanWork, "Shop Shift", "2025-12-06T16:00:00Z", "2025-12-06T23:00:00Z", "Saturday shift at the auto shop.", ["work", "mechanic"], "Oil changes + brake jobs.", false),
  ev(CAL.ivanFishing, "Lake Fishing Trip", "2025-12-28T14:30:00Z", "2025-12-28T18:00:00Z", "Morning-to-afternoon fishing.", ["fishing", "outdoors"], "Bring warm gear.", false),

  // Julia (Student + Piano)
  ev(CAL.juliaSchool, "Study Session - Calculus", "2025-12-15T21:00:00Z", "2025-12-15T23:00:00Z", "Review integrals and series.", ["school", "study"], "Focus: practice set #4.", false),
  ev(CAL.juliaPiano, "Piano Practice", "2025-12-17T00:30:00Z", "2025-12-17T01:15:00Z", "Technique + repertoire.", ["music", "piano"], "Scales + one new piece.", false),

  // Shared: Family + Social + Holidays
  ev(CAL.family, "Family Dinner", "2025-12-24T23:00:00Z", "2025-12-25T02:00:00Z", "Holiday family dinner.", ["family", "holiday"], "Bring dessert and a small gift.", true), // exception (holiday evening)
  ev(CAL.social, "Friends Movie Night", "2025-12-14T02:00:00Z", "2025-12-14T06:00:00Z", "Weekend movie marathon.", ["social", "weekend"], "Vote on the movie list.", true), // weekend late
  ev(CAL.holidays, "New Year's Eve Plans", "2025-12-31T21:00:00Z", "2026-01-01T02:30:00Z", "New Year's celebration.", ["holiday", "social"], "Meet downtown; rideshare home.", true), // midnight-ish

  // -----------------------
  // JANUARY 2026 (spread)
  // -----------------------

  // Alice
  ev(CAL.aliceWork, "Architecture Deep Dive", "2026-01-06T17:00:00Z", "2026-01-06T18:30:00Z", "Review service boundaries and API contracts.", ["work", "engineering"], "Capture decisions in notes.", false),
  ev(CAL.aliceClimbing, "Climbing Gym", "2026-01-09T23:00:00Z", "2026-01-10T00:30:00Z", "Strength training + boulders.", ["climbing", "fitness"], "Try 2 new routes.", false),
  ev(CAL.alicePersonal, "Therapy Appointment", "2026-01-13T16:00:00Z", "2026-01-13T16:50:00Z", "Routine appointment.", ["personal"], "", false),

  // Bob
  ev(CAL.bobWork, "Brunch Service", "2026-01-04T16:00:00Z", "2026-01-04T20:00:00Z", "Sunday brunch shift.", ["work", "chef"], "Prep: omelet station.", false),
  ev(CAL.bobCycling, "Group Ride", "2026-01-11T15:00:00Z", "2026-01-11T16:45:00Z", "Weekend group ride.", ["cycling", "social"], "Meet at the trailhead.", true),
  ev(CAL.bobPersonal, "Bike Maintenance", "2026-01-14T23:30:00Z", "2026-01-15T00:30:00Z", "Tune brakes and clean chain.", ["cycling", "personal"], "Replace worn brake pads.", false),

  // Charlie
  ev(CAL.charlieWork, "Lesson Planning", "2026-01-05T16:30:00Z", "2026-01-05T18:00:00Z", "Plan unit on quadratic functions.", ["school", "planning"], "Build quick checks.", false),
  ev(CAL.charlieGaming, "Online Co-op Night", "2026-01-17T02:00:00Z", "2026-01-17T06:00:00Z", "Weekend co-op session.", ["gaming", "social"], "New campaign start.", true), // weekend late
  ev(CAL.charliePersonal, "Coffee with Mentor", "2026-01-22T17:00:00Z", "2026-01-22T18:00:00Z", "Career check-in.", ["personal"], "Bring questions about next steps.", false),

  // Diana
  ev(CAL.dianaWork, "Hospital Shift", "2026-01-07T13:00:00Z", "2026-01-07T21:00:00Z", "Day shift.", ["work", "nurse"], "", false),
  ev(CAL.dianaYoga, "Yoga Class", "2026-01-10T16:00:00Z", "2026-01-10T17:00:00Z", "Weekend morning yoga.", ["yoga", "wellness"], "Focus: flexibility.", false),
  ev(CAL.dianaPersonal, "Meal Prep", "2026-01-25T17:00:00Z", "2026-01-25T18:15:00Z", "Prep healthy meals for the week.", ["personal", "routine"], "Stock up on greens.", false),

  // Ethan
  ev(CAL.ethanWork, "Roadmap Review", "2026-01-08T18:00:00Z", "2026-01-08T19:00:00Z", "Review roadmap and risks.", ["work", "pm"], "Update timeline assumptions.", false),
  ev(CAL.ethanPhoto, "Portrait Session", "2026-01-24T19:00:00Z", "2026-01-24T20:30:00Z", "Portrait shoot for a friend.", ["photography"], "Bring reflector.", false),
  ev(CAL.holidays, "Weekend Trip Planning", "2026-01-18T18:00:00Z", "2026-01-18T19:00:00Z", "Plan February weekend getaway.", ["travel"], "Shortlist hotels.", false),

  // Fiona
  ev(CAL.fionaWork, "UX Workshop", "2026-01-12T17:00:00Z", "2026-01-12T18:30:00Z", "Facilitate user flow workshop.", ["work", "design"], "Collect pain points.", false),
  ev(CAL.fionaRunning, "Long Run", "2026-01-18T14:00:00Z", "2026-01-18T15:45:00Z", "Weekend long run.", ["running", "fitness"], "Easy pace.", false),
  ev(CAL.fionaPersonal, "Dentist", "2026-01-27T16:00:00Z", "2026-01-27T16:45:00Z", "Cleaning appointment.", ["personal", "health"], "", false),

  // George
  ev(CAL.georgeWork, "Budget Forecast", "2026-01-09T16:00:00Z", "2026-01-09T17:30:00Z", "Update forecast for Q1.", ["work", "accounting"], "Review variance drivers.", false),
  ev(CAL.georgeWood, "Woodworking Project Night", "2026-01-15T23:00:00Z", "2026-01-16T01:00:00Z", "Late-night shop time.", ["woodworking"], "Sand + finish coat.", false), // exception-ish but still close
  ev(CAL.georgePersonal, "Car Service Appointment", "2026-01-20T18:00:00Z", "2026-01-20T19:00:00Z", "Oil change + inspection.", ["personal"], "", false),

  // Hannah
  ev(CAL.hannahWork, "Content Review", "2026-01-06T18:00:00Z", "2026-01-06T19:00:00Z", "Review content drafts and schedule posts.", ["work", "marketing"], "", false),
  ev(CAL.hannahSalsa, "Salsa Social", "2026-01-24T02:00:00Z", "2026-01-24T06:00:00Z", "Weekend salsa social (late).", ["salsa", "social"], "Invite friends to join.", true), // weekend late
  ev(CAL.hannahPersonal, "Haircut", "2026-01-28T17:30:00Z", "2026-01-28T18:30:00Z", "Appointment.", ["personal"], "", false),

  // Ivan
  ev(CAL.ivanWork, "Shop Shift", "2026-01-03T16:00:00Z", "2026-01-03T23:00:00Z", "Saturday shift.", ["work", "mechanic"], "Focus: diagnostics.", false),
  ev(CAL.ivanFishing, "River Fishing", "2026-01-11T14:00:00Z", "2026-01-11T17:30:00Z", "Weekend fishing trip.", ["fishing", "outdoors"], "Try new lure.", false),
  ev(CAL.ivanPersonal, "Tool Inventory", "2026-01-21T23:00:00Z", "2026-01-22T00:00:00Z", "Organize tools and restock supplies.", ["personal"], "Order sockets set.", false),

  // Julia
  ev(CAL.juliaSchool, "Lab Session", "2026-01-14T18:00:00Z", "2026-01-14T20:00:00Z", "Work on assignment and attend lab help.", ["school"], "Bring laptop + notes.", false),
  ev(CAL.juliaPiano, "Piano Lesson", "2026-01-07T23:00:00Z", "2026-01-07T23:45:00Z", "Weekly lesson.", ["piano", "music"], "Practice arpeggios.", false),
  ev(CAL.juliaPersonal, "Study Group", "2026-01-30T01:00:00Z", "2026-01-30T03:00:00Z", "Evening study group session.", ["school", "social"], "Prep questions in advance.", false),

  // Shared
  ev(CAL.family, "Family Brunch", "2026-01-04T17:00:00Z", "2026-01-04T19:00:00Z", "Monthly family brunch.", ["family"], "Bring fruit salad.", true),
  ev(CAL.social, "Game Night (Friends)", "2026-01-10T02:00:00Z", "2026-01-10T06:00:00Z", "Weekend game night.", ["social", "weekend"], "Bring snacks.", true),
  ev(CAL.holidays, "Book February Weekend Trip", "2026-01-26T18:00:00Z", "2026-01-26T18:45:00Z", "Finalize bookings for February.", ["travel"], "Confirm PTO + hotel.", false),

  // -----------------------
  // FEBRUARY 2026 (spread)
  // -----------------------

  // Alice
  ev(CAL.aliceWork, "Release Planning", "2026-02-03T17:00:00Z", "2026-02-03T18:00:00Z", "Plan release cut and stability window.", ["work", "release"], "Identify risky tickets.", false),
  ev(CAL.aliceClimbing, "Outdoor Climb (Day Trip)", "2026-02-15T16:00:00Z", "2026-02-15T22:00:00Z", "Weekend outdoor climbing trip.", ["climbing", "outdoors"], "Pack harness + chalk.", true),
  ev(CAL.alicePersonal, "Laundry + Reset", "2026-02-22T17:00:00Z", "2026-02-22T18:30:00Z", "Home reset and errands.", ["personal"], "", false),

  // Bob
  ev(CAL.bobWork, "Valentine's Dinner Service", "2026-02-14T23:00:00Z", "2026-02-15T03:30:00Z", "High-volume holiday service.", ["work", "chef"], "Arrive early for prep.", false), // exception (late)
  ev(CAL.bobCycling, "Intervals Ride", "2026-02-07T15:00:00Z", "2026-02-07T16:00:00Z", "Short hard intervals.", ["cycling", "fitness"], "Warm up 15 minutes.", false),
  ev(CAL.bobPersonal, "Friend Birthday Gift", "2026-02-20T18:00:00Z", "2026-02-20T18:45:00Z", "Pick up gift.", ["personal"], "", false),

  // Charlie
  ev(CAL.charlieWork, "Parent-Teacher Conferences", "2026-02-05T22:00:00Z", "2026-02-06T00:00:00Z", "Evening conferences.", ["school", "meeting"], "Have grade summaries ready.", false),
  ev(CAL.charlieGaming, "LAN Party", "2026-02-21T02:00:00Z", "2026-02-21T06:00:00Z", "Weekend LAN party.", ["gaming", "social"], "Bring headset.", true),
  ev(CAL.charliePersonal, "Gym", "2026-02-10T23:00:00Z", "2026-02-10T23:45:00Z", "Strength workout.", ["fitness"], "", false),

  // Diana
  ev(CAL.dianaWork, "Hospital Shift", "2026-02-02T13:00:00Z", "2026-02-02T21:00:00Z", "Day shift.", ["work", "nurse"], "", false),
  ev(CAL.dianaYoga, "Hot Yoga", "2026-02-12T00:00:00Z", "2026-02-12T01:00:00Z", "Evening hot yoga class.", ["yoga"], "Bring towel + water.", false),
  ev(CAL.dianaPersonal, "Volunteer Shift", "2026-02-28T16:00:00Z", "2026-02-28T18:00:00Z", "Community clinic volunteer work.", ["personal", "volunteer"], "", false),

  // Ethan
  ev(CAL.ethanWork, "Quarterly Planning", "2026-02-04T18:00:00Z", "2026-02-04T19:30:00Z", "Quarterly planning meeting.", ["work", "pm"], "Bring draft roadmap.", false),
  ev(CAL.ethanPhoto, "Photo Editing Session", "2026-02-16T23:00:00Z", "2026-02-17T00:30:00Z", "Edit recent shoots.", ["photography"], "Cull + color correct.", false),
  ev(CAL.holidays, "February Weekend Trip", "2026-02-07T16:00:00Z", "2026-02-08T22:00:00Z", "Weekend getaway.", ["travel"], "Check-in 4pm; return Sunday evening.", true),

  // Fiona
  ev(CAL.fionaWork, "Prototype Handoff", "2026-02-06T18:00:00Z", "2026-02-06T18:45:00Z", "Handoff prototype to engineering.", ["work", "design"], "Confirm interactions.", false),
  ev(CAL.fionaRunning, "5K Race", "2026-02-14T14:00:00Z", "2026-02-14T15:00:00Z", "Local 5K event.", ["running", "race"], "Pick up bib early.", true),
  ev(CAL.fionaPersonal, "Dinner with Friend", "2026-02-27T23:00:00Z", "2026-02-28T01:00:00Z", "Friday night dinner.", ["social"], "Try the new place downtown.", true),

  // George
  ev(CAL.georgeWork, "Tax Prep Block", "2026-02-09T16:00:00Z", "2026-02-09T18:30:00Z", "Client tax prep and review.", ["work", "accounting"], "Gather documents.", false),
  ev(CAL.georgeWood, "Build Cabinet Doors", "2026-02-19T23:00:00Z", "2026-02-20T00:30:00Z", "Shop work session.", ["woodworking"], "Cut + sand panels.", false),
  ev(CAL.georgePersonal, "Coffee with Family", "2026-02-01T17:00:00Z", "2026-02-01T18:00:00Z", "Sunday coffee catch-up.", ["family"], "", false),

  // Hannah
  ev(CAL.hannahWork, "Launch Prep Meeting", "2026-02-11T18:00:00Z", "2026-02-11T19:00:00Z", "Prepare campaign launch assets.", ["work", "marketing"], "Finalize copy + creative.", false),
  ev(CAL.hannahSalsa, "Salsa Practice", "2026-02-05T01:00:00Z", "2026-02-05T02:00:00Z", "Technique practice night.", ["salsa"], "Footwork drills.", false),
  ev(CAL.hannahPersonal, "Weekend Social - Live Music", "2026-02-22T02:00:00Z", "2026-02-22T06:00:00Z", "Weekend live music night.", ["social", "weekend"], "Meet friends at 8pm local.", true),

  // Ivan
  ev(CAL.ivanWork, "Shop Shift", "2026-02-07T16:00:00Z", "2026-02-07T23:00:00Z", "Saturday shop work.", ["work", "mechanic"], "Rotate tires + diagnostics.", false),
  ev(CAL.ivanFishing, "Early Morning Fishing", "2026-02-08T12:00:00Z", "2026-02-08T16:00:00Z", "Sunday morning fishing.", ["fishing"], "Bring coffee.", false),
  ev(CAL.ivanPersonal, "Tool Order Pickup", "2026-02-17T18:00:00Z", "2026-02-17T18:30:00Z", "Pick up parts/tools order.", ["personal"], "", false),

  // Julia
  ev(CAL.juliaSchool, "Midterm Exam", "2026-02-03T19:00:00Z", "2026-02-03T21:00:00Z", "Midterm exam session.", ["school", "exam"], "Arrive 15 minutes early.", false),
  ev(CAL.juliaPiano, "Recital Practice", "2026-02-26T00:00:00Z", "2026-02-26T01:00:00Z", "Practice full recital set.", ["piano", "music"], "Run full program twice.", false),
  ev(CAL.juliaPersonal, "Study + Planning", "2026-02-12T18:00:00Z", "2026-02-12T19:30:00Z", "Plan next week and study.", ["personal", "school"], "Update task list.", false),

  // Shared
  ev(CAL.family, "Family Game Night", "2026-02-01T02:00:00Z", "2026-02-01T05:00:00Z", "Weekend family game night.", ["family", "weekend"], "Bring a party game.", true),
  ev(CAL.social, "Friends Potluck", "2026-02-08T00:30:00Z", "2026-02-08T04:00:00Z", "Saturday potluck dinner.", ["social", "weekend"], "Everyone brings one dish.", true),
  ev(CAL.holidays, "Plan Spring Break", "2026-02-23T18:00:00Z", "2026-02-23T18:45:00Z", "Start planning spring break travel.", ["travel", "planning"], "Pick destination shortlist.", false),
]);

print("added events");

// =================================================
// POLLS
// - Updated to match the new shared calendars + hobbies
// =================================================
print("adding polls");
db.createCollection("polls");

const pollNow = new Date();
const pollOneWeekLater = new Date(pollNow.getTime() + 7 * 24 * 60 * 60 * 1000);

db.polls.insertMany([
  {
    calendarId: CAL.social,
    title: "Pick a February hangout",
    description: "Vote on what we should do for our February get-together.",
    notes: "Choose what works best—results are visible.",
    startTime: new Date("2026-02-05T00:00:00Z"),
    endTime: new Date("2026-02-10T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: true,
    tags: ["social", "planning"],
    inviteLinks: [{ token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater }],
    optionsList: {
      "0": {
        optionId: 0,
        description: "Potluck + board games",
        userVotes: [USER.Alice, USER.Charlie, USER.Hannah],
        guestVotes: ["Sam (guest)"],
      },
      "1": {
        optionId: 1,
        description: "Bowling night",
        userVotes: [USER.Bob, USER.Ivan],
        guestVotes: [],
      },
      "2": {
        optionId: 2,
        description: "Dinner out",
        userVotes: [USER.Fiona, USER.Julia],
        guestVotes: ["Alex (guest)"],
      },
    },
  },
  {
    calendarId: CAL.family,
    title: "Family dinner date",
    description: "Pick the best weekend for a family dinner this month.",
    notes: "",
    startTime: new Date("2026-01-20T00:00:00Z"),
    endTime: new Date("2026-01-26T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: false,
    tags: ["family", "scheduling"],
    inviteLinks: [],
    optionsList: {
      "0": { optionId: 0, description: "Saturday", userVotes: [USER.Diana, USER.George], guestVotes: [] },
      "1": { optionId: 1, description: "Sunday", userVotes: [USER.Bob, USER.Alice], guestVotes: ["Grandma (guest)"] },
    },
  },
  {
    calendarId: CAL.holidays,
    title: "Spring travel preference",
    description: "Quick poll to get a feel for spring travel ideas.",
    notes: "Results hidden until poll ends.",
    startTime: new Date("2026-02-20T00:00:00Z"),
    endTime: new Date("2026-02-27T23:59:59Z"),
    resultsVisible: false,
    allowMultipleVotes: false,
    tags: ["travel", "planning"],
    inviteLinks: [{ token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater }],
    optionsList: {
      "0": { optionId: 0, description: "Beach weekend", userVotes: [USER.Ethan, USER.Fiona], guestVotes: [] },
      "1": { optionId: 1, description: "Mountain cabin", userVotes: [USER.Alice, USER.Ivan], guestVotes: ["Chris (guest)"] },
      "2": { optionId: 2, description: "City trip", userVotes: [USER.Hannah, USER.Julia], guestVotes: [] },
    },
  },
  {
    calendarId: CAL.aliceClimbing,
    title: "Climbing day this month",
    description: "Pick which weekend works best for an outdoor climb.",
    notes: "",
    startTime: new Date("2026-02-10T00:00:00Z"),
    endTime: new Date("2026-02-15T23:59:59Z"),
    resultsVisible: true,
    allowMultipleVotes: true,
    tags: ["climbing", "planning"],
    inviteLinks: [],
    optionsList: {
      "0": { optionId: 0, description: "Weekend 1", userVotes: [USER.Alice], guestVotes: ["Taylor (guest)"] },
      "1": { optionId: 1, description: "Weekend 2", userVotes: [USER.Alice, USER.Bob], guestVotes: [] },
    },
  },
]);
print("added polls");

// =================================================
// SUMMARY
// =================================================
print("\n========== Database Setup Complete ==========");
print("Collections created:");
print("  - calendars: " + db.calendars.countDocuments() + " documents");
print("  - users: " + db.users.countDocuments() + " documents");
print("  - events: " + db.events.countDocuments() + " documents");
print("  - polls: " + db.polls.countDocuments() + " documents");

print("\nTest accounts (all use password: 'password'):");
print("  - Alice (superuser)");
print("  - Bob");
print("  - Charlie");
print("  - Diana");
print("  - Ethan");
print("  - Fiona");
print("  - George");
print("  - Hannah");
print("  - Ivan");
print("  - Julia");

print("\nNotes:");
print("  - Events span Dec 2025, Jan 2026, Feb 2026.");
print("  - Most events fall between ~6am–10pm (UTC), with a few late weekend/social exceptions.");
print("=============================================\n");

print("✅ database seeded successfully");