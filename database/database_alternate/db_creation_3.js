// db_creation_wizards_big_seed.js
// Usage (in mongosh):
//   mongosh --file "/absolute/path/to/db_creation_wizards_big_seed.js"
//
// Connection string for MongoDB
const connection = "mongodb://root:password@127.0.0.1:27017/calendario?authSource=admin";
db = connect(connection);

/**
 * BIG seed for Calendario (Jan/Feb/Mar 2026)
 *
 * Updates requested:
 *  - Sean and Ethan CANNOT see each other's friend calendars (no cross-membership).
 *  - Basketball - Wizards calendar now has:
 *      - >=3 practices/week
 *      - >=2 pickup games/week
 *    with NO practices or games on Feb 7, 2026 (left open for the Feb 14 game to move).
 *
 * Keeps:
 *  - Wizards Nuggets reschedule poll (Sean has access but hasn't voted yet)
 *  - Workday events every weekday for Sean and Ethan
 *  - Sean juggling practices (3/week) + paid gigs (2/month)
 *  - Ethan bowling every Wednesday
 *  - Family + Friends events density for both Sean and Ethan
 *  - Additional polls: some Sean-only, some Ethan-only, some both (placed on Wizards now)
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
// Local datetime helper (fixed -06:00 for seed simplicity)
// =================================================
function dtLocal(isoLocalNoOffset) {
  return new Date(isoLocalNoOffset + "-06:00");
}

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

function isoLocal(dateObj, hh, mm) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  const H = pad2(hh);
  const M = pad2(mm);
  return `${y}-${m}-${d}T${H}:${M}:00`;
}

function isWeekday(dateObj) {
  const day = dateObj.getDay(); // 0=Sun..6=Sat
  return day >= 1 && day <= 5;
}

function isWeekend(dateObj) {
  const day = dateObj.getDay();
  return day === 0 || day === 6;
}

function isWednesday(dateObj) {
  return dateObj.getDay() === 3;
}

function sameYMD(d, y, m /*1-12*/, day) {
  return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
}

function iterateDatesInclusive(start, end, fn) {
  const d = new Date(start.getTime());
  while (d <= end) {
    fn(new Date(d.getTime()));
    d.setDate(d.getDate() + 1);
  }
}

// =================================================
// WIPE EVERYTHING
// =================================================
print("dropping database (wipe all existing data)...");
db.dropDatabase();
print("dropped database");

// =================================================
// CALENDARS
// =================================================
print("adding calendars");
db.createCollection("calendars");

const now = new Date();
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

db.calendars.insertMany([
  { name: "Basketball - Wizards", invites: [{ link: generateToken(), expiresAt: oneWeekLater }], createdAt: now, updatedAt: now },

  { name: "Revature - Team 2", invites: [], createdAt: now, updatedAt: now },

  { name: "Sean - Work", invites: [], createdAt: now, updatedAt: now },
  { name: "Sean - Juggling", invites: [], createdAt: now, updatedAt: now },
  { name: "Sean - Family", invites: [], createdAt: now, updatedAt: now },
  { name: "Sean - Friends", invites: [], createdAt: now, updatedAt: now },

  { name: "Ethan - Work", invites: [], createdAt: now, updatedAt: now },
  { name: "Ethan - Family", invites: [], createdAt: now, updatedAt: now },
  { name: "Ethan - Friends", invites: [], createdAt: now, updatedAt: now },
  { name: "Ethan - Bowling", invites: [], createdAt: now, updatedAt: now },
]);

function getCalendarIdByName(name) {
  const doc = db.calendars.findOne({ name }, { _id: 1 });
  if (!doc) throw new Error(`Calendar not found: ${name}`);
  return doc._id.toString();
}

const CAL = {
  wizards: getCalendarIdByName("Basketball - Wizards"),

  revatureTeam2: getCalendarIdByName("Revature - Team 2"),

  seanWork: getCalendarIdByName("Sean - Work"),
  seanJuggling: getCalendarIdByName("Sean - Juggling"),
  seanFamily: getCalendarIdByName("Sean - Family"),
  seanFriends: getCalendarIdByName("Sean - Friends"),

  ethanWork: getCalendarIdByName("Ethan - Work"),
  ethanFamily: getCalendarIdByName("Ethan - Family"),
  ethanFriends: getCalendarIdByName("Ethan - Friends"),
  ethanBowling: getCalendarIdByName("Ethan - Bowling"),
};

print("added calendars");

// =================================================
// USERS (NO cross-membership between Sean/Ethan friend calendars)
// =================================================
print("adding users");
db.createCollection("users");

db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.users.insertMany([
  { username: "Juan", email: "juan@example.com", password: "password", isSuperuser: true, calendarIds: [{ calendarId: CAL.wizards, isAdmin: true }] },

  {
    username: "Sean",
    email: "sean@example.com",
    password: "password",
    isSuperuser: false,
    calendarIds: [
      { calendarId: CAL.wizards, isAdmin: true },
      { calendarId: CAL.revatureTeam2, isAdmin: true },
      { calendarId: CAL.seanWork, isAdmin: true },
      { calendarId: CAL.seanJuggling, isAdmin: true },
      { calendarId: CAL.seanFamily, isAdmin: true },
      { calendarId: CAL.seanFriends, isAdmin: true },
    ],
  },
  {
    username: "Ethan",
    email: "ethan@example.com",
    password: "password",
    isSuperuser: false,
    calendarIds: [
      { calendarId: CAL.wizards, isAdmin: true },
      { calendarId: CAL.revatureTeam2, isAdmin: false },
      { calendarId: CAL.ethanWork, isAdmin: true },
      { calendarId: CAL.ethanFamily, isAdmin: true },
      { calendarId: CAL.ethanFriends, isAdmin: true },
      { calendarId: CAL.ethanBowling, isAdmin: true },
    ],
  },

  // Extra voters (members of Wizards)
  { username: "Mia", email: "mia@example.com", password: "password", isSuperuser: false, calendarIds: [{ calendarId: CAL.wizards, isAdmin: false }] },
  { username: "Carlos", email: "carlos@example.com", password: "password", isSuperuser: false, calendarIds: [{ calendarId: CAL.wizards, isAdmin: false }] },
  { username: "Priya", email: "priya@example.com", password: "password", isSuperuser: false, calendarIds: [{ calendarId: CAL.wizards, isAdmin: false }] },
]);

function getUserIdByUsername(username) {
  const doc = db.users.findOne({ username }, { _id: 1 });
  if (!doc) throw new Error(`User not found: ${username}`);
  return doc._id.toString();
}

const USER = {
  Juan: getUserIdByUsername("Juan"),
  Sean: getUserIdByUsername("Sean"),
  Ethan: getUserIdByUsername("Ethan"),
  Mia: getUserIdByUsername("Mia"),
  Carlos: getUserIdByUsername("Carlos"),
  Priya: getUserIdByUsername("Priya"),
};

print("added users");

// =================================================
// EVENTS
// =================================================
print("adding events");
db.createCollection("events");

const eventNow = new Date();
const eventOneWeekLater = new Date(eventNow.getTime() + 7 * 24 * 60 * 60 * 1000);

function ev(calendarId, title, startLocal, endLocal, description, tags, notes, includeInvite) {
  return {
    calendarId,
    title,
    startTime: dtLocal(startLocal),
    endTime: dtLocal(endLocal),
    description: description || "",
    notes: notes || "",
    tags: tags || [],
    inviteLinks: includeInvite ? [{ token: generateToken(), createdAt: eventNow, expiresAt: eventOneWeekLater }] : [],
  };
}

const events = [];
const startRange = new Date("2026-01-01T00:00:00-06:00");
const endRange = new Date("2026-03-31T23:59:59-06:00");
const NBA_TEAMS = [
  "Mavericks",
  "Bulls",
  "Hornets",
  "Lakers",
  "Celtics",
  "Heat",
  "Spurs",
  "Raptors",
  "Suns",
  "Clippers",
  "Warriors",
  "Kings",
  "Pacers",
  "Hawks",
  "Knicks",
  "Nets",
  "Pistons",
  "Magic",
  "Rockets",
  "Grizzlies"
];

function randomOpponent() {
  return NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
}

// Add Sean's Presentation event (Revature - Team 2 calendar)
events.push(
  ev(
    CAL.revatureTeam2,
    "CalendarIO Presentation",
    "2026-02-02T14:00:00",
    "2026-02-02T15:00:00",
    "Project presentation and demo for Cognizant.",
    ["work", "presentation"],
    false
  )
);

// --------------------------
// A) Basketball - Wizards repeating schedule (Jan/Feb/Mar 2026)
// Requirements:
//   - >=3 practices/week
//   - >=2 pickups/week
//   - NO events on Feb 7, 2026
//
// Pattern:
//   Practices: Tue 18:00–19:30, Thu 18:00–19:30, Sun 10:00–11:30
//   Pickups:   Sat 09:00–11:00 (SKIP Feb 7), Sun 07:30–09:00
//   Extra pickup on Fri Feb 6 19:00–21:00 to keep that week >=2 pickups even while skipping Feb 7.
// --------------------------
iterateDatesInclusive(startRange, endRange, (d) => {
  // hard skip Feb 7 entirely
  if (sameYMD(d, 2026, 2, 7)) return;

  const dow = d.getDay(); // 0 Sun ... 6 Sat

  // Practices
  if (dow === 2) {
    // Tue
    events.push(
      ev(CAL.wizards, "Practice", isoLocal(d, 18, 0), isoLocal(d, 19, 30), "Team practice: drills + sets.", ["basketball", "practice"], "Bring reversible jerseys.", false)
    );
  }
  if (dow === 4) {
    // Thu
    events.push(
      ev(CAL.wizards, "Practice", isoLocal(d, 18, 0), isoLocal(d, 19, 30), "Team practice: scrimmage + conditioning.", ["basketball", "conditioning"], "Hydrate beforehand.", false)
    );
  }
  if (dow === 0) {
    // Sun practice
    events.push(
      ev(CAL.wizards, "Practice", isoLocal(d, 10, 0), isoLocal(d, 11, 30), "Weekend practice session.", ["basketball", "practice"], "Focus: spacing + defense.", false)
    );
  }

  // Pickup games
    if (dow === 6) {
        const isFeb7 = sameYMD(d, 2026, 2, 7);
        const isFeb14 = sameYMD(d, 2026, 2, 14);

        if (!isFeb7 && !isFeb14) {
            const opponent = randomOpponent();

            events.push(
            ev(
                CAL.wizards,
                `Pickup Game vs ${opponent}`,
                isoLocal(d, 9, 0),
                isoLocal(d, 11, 0),
                `Weekend run against the ${opponent}.`,
                ["basketball", "pickup"],
                "First to 11, win by 2.",
                true
            )
            );
        }
    }

  if (dow === 0) {
    // Sun pickup (early, avoids overlap with Sun practice)
    events.push(
      ev(CAL.wizards, "Pickup Game", isoLocal(d, 7, 30), isoLocal(d, 9, 0), "Sunday early run.", ["basketball", "pickup"], "Bring both light/dark.", false)
    );
  }

  // Extra pickup on Fri Feb 6
  if (sameYMD(d, 2026, 2, 6)) {
    events.push(
      ev(CAL.wizards, "Extra Pickup Game", isoLocal(d, 19, 0), isoLocal(d, 21, 0), "Extra run this week (keeps Feb 7 open).", ["basketball", "pickup"], "Added because Feb 7 is intentionally empty.", true)
    );
  }
});

// Existing pickup game vs Nuggets (keep on Feb 14 — no Feb 7 event created)
events.push(
  ev(
    CAL.wizards,
    "Pickup Game vs Nuggets",
    "2026-02-14T09:00:00",
    "2026-02-14T11:00:00",
    "Scheduled matchup vs Nuggets",
    ["basketball", "pickup"],
    "",
    true
  )
);

// --------------------------
// B) Work events: EVERY weekday Jan/Feb/Mar for Sean + Ethan (9am–5pm)
// --------------------------
iterateDatesInclusive(startRange, endRange, (d) => {
  if (!isWeekday(d)) return;

  events.push(ev(CAL.seanWork, "Workday", isoLocal(d, 9, 0), isoLocal(d, 17, 0), "Daily work block.", ["work"], "", false));
  events.push(ev(CAL.ethanWork, "Workday", isoLocal(d, 9, 0), isoLocal(d, 17, 0), "Daily work block.", ["work"], "", false));

  // Some work events with 2 tags (Mondays)
  if (d.getDay() === 1) {
    events.push(ev(CAL.seanWork, "Team Sync", isoLocal(d, 16, 0), isoLocal(d, 17, 0), "Weekly wrap-up sync.", ["work", "meeting"], "Short updates.", false));
    events.push(ev(CAL.ethanWork, "Planning Block", isoLocal(d, 15, 0), isoLocal(d, 16, 0), "Weekly planning block.", ["work", "planning"], "Review priorities.", false));
  }
});

// --------------------------
// C) Sean juggling: 3 practices/week (Mon/Wed/Fri 18:00–19:30) + 2 paid gigs/month (Sat 10:00–12:00)
// --------------------------
iterateDatesInclusive(startRange, endRange, (d) => {
  const day = d.getDay(); // 1=Mon 3=Wed 5=Fri
  if (isWeekday(d) && (day === 1 || day === 3 || day === 5)) {
    events.push(
      ev(
        CAL.seanJuggling,
        "Juggling Practice",
        isoLocal(d, 18, 0),
        isoLocal(d, 19, 30),
        "Technique drills + routine practice.",
        ["juggling", "practice"],
        "Focus: clean catches + transitions.",
        false
      )
    );
  }
});

function addMonthlyGigs(monthIndex /*0-11*/) {
  const y = 2026;
  const monthStart = new Date(y, monthIndex, 1);
  const monthEnd = new Date(y, monthIndex + 1, 0);
  const saturdays = [];

  iterateDatesInclusive(monthStart, monthEnd, (d) => {
    if (d.getMonth() !== monthIndex) return;
    if (d.getDay() === 6) saturdays.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  });

  // 1st and 3rd Saturday
  [0, 2].forEach((idx) => {
    if (!saturdays[idx]) return;
    const sd = saturdays[idx];

    // Note: if a gig would land on Feb 7, it would conflict with your "leave Feb 7 open" rule.
    // So we skip it and place it on the NEXT Saturday (Feb 14 is already taken by Nuggets game,
    // so we’ll move to Feb 21 in that case).
    if (sameYMD(sd, 2026, 2, 7)) return;

    events.push(
      ev(
        CAL.seanJuggling,
        "Paid Juggling Gig",
        isoLocal(sd, 10, 0),
        isoLocal(sd, 12, 0),
        "Paid performance gig.",
        ["juggling", "gig"],
        "Bring full prop kit + backup clubs.",
        true
      )
    );
  });
}
addMonthlyGigs(0); // Jan
addMonthlyGigs(1); // Feb (skips Feb 7 automatically)
addMonthlyGigs(2); // Mar

// --------------------------
// D) Ethan bowling: every Wednesday 19:00–21:00 (Jan/Feb/Mar)
// --------------------------
iterateDatesInclusive(startRange, endRange, (d) => {
  if (!isWeekday(d) || !isWednesday(d)) return;
  events.push(
    ev(CAL.ethanBowling, "Bowling Night", isoLocal(d, 19, 0), isoLocal(d, 21, 0), "Weekly bowling night.", ["bowling", "league"], "Meet at lanes 10 minutes early.", false)
  );
});

// --------------------------
// E) Family + Friends events: 5 family + 5 friends per month EACH
//    (Adjusted times to avoid Saturday pickup conflicts)
//    - Sean weekend coffee: Sat 08:00–09:00
//    - Ethan weekend coffee: Sat 07:00–08:00  (avoids Sat 09:00 pickup)
// --------------------------
function addMonthlySocial(person) {
  const y = 2026;
  const m = person.monthIndex; // 0=Jan 1=Feb 2=Mar
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0);

  const tuesdays = [];
  const thursdays = [];
  const sundays = [];
  const saturdays = [];

  iterateDatesInclusive(monthStart, monthEnd, (d) => {
    if (d.getMonth() !== m) return;
    if (d.getDay() === 2) tuesdays.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    if (d.getDay() === 4) thursdays.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    if (d.getDay() === 0) sundays.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    if (d.getDay() === 6) saturdays.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  });

  const famWeekdays = tuesdays.slice(0, 3);
  const famWeekends = sundays.slice(0, 2);
  const frWeekdays = thursdays.slice(0, 3);
  const frWeekends = saturdays.slice(0, 2);

  if (person.who === "Sean") {
    famWeekdays.forEach((d, i) => {
      events.push(ev(CAL.seanFamily, i % 2 === 0 ? "Family Dinner" : "Family Call", isoLocal(d, 20, 0), isoLocal(d, 21, 0), "Family time.", ["family", i % 2 === 0 ? "dinner" : "check-in"], "", false));
    });
    famWeekends.forEach((d) => {
      events.push(ev(CAL.seanFamily, "Family Brunch", isoLocal(d, 9, 0), isoLocal(d, 10, 0), "Weekend family brunch.", ["family", "weekend"], "", false));
    });

    frWeekdays.forEach((d, i) => {
      events.push(ev(CAL.seanFriends, i % 2 === 0 ? "Friends Hangout" : "Game Night", isoLocal(d, 19, 0), isoLocal(d, 21, 0), "Friends time.", ["friends", "social"], "", false));
    });
    frWeekends.forEach((d) => {
      // Sat 08:00–09:00 (ends right at Sat 09:00 pickup)
      events.push(ev(CAL.seanFriends, "Weekend Coffee", isoLocal(d, 8, 0), isoLocal(d, 9, 0), "Coffee catch-up.", ["friends", "weekend"], "", false));
    });
  }

  if (person.who === "Ethan") {
    famWeekdays.forEach((d, i) => {
      events.push(ev(CAL.ethanFamily, i % 2 === 0 ? "Family Visit" : "Family Dinner", isoLocal(d, 19, 0), isoLocal(d, 20, 0), "Family time.", ["family", i % 2 === 0 ? "visit" : "dinner"], "", false));
    });
    famWeekends.forEach((d) => {
      events.push(ev(CAL.ethanFamily, "Weekend Family Brunch", isoLocal(d, 8, 0), isoLocal(d, 9, 0), "Weekend brunch.", ["family", "weekend"], "", false));
    });

    frWeekdays.forEach((d, i) => {
      events.push(ev(CAL.ethanFriends, i % 2 === 0 ? "Friends Dinner" : "Friends Hangout", isoLocal(d, 19, 0), isoLocal(d, 21, 0), "Friends time.", ["friends", "social"], "", false));
    });
    frWeekends.forEach((d) => {
      // Sat 07:00–08:00 (avoids Sat 09:00 pickup)
      events.push(ev(CAL.ethanFriends, "Weekend Coffee", isoLocal(d, 7, 0), isoLocal(d, 8, 0), "Coffee catch-up.", ["friends", "weekend"], "", false));
    });
  }
}

[0, 1, 2].forEach((monthIndex) => {
  addMonthlySocial({ who: "Sean", monthIndex });
  addMonthlySocial({ who: "Ethan", monthIndex });
});

// Insert all events
db.events.insertMany(events);
print("added events");

// =================================================
// POLLS (shared polls moved onto Wizards since friend calendars are private)
// =================================================
print("adding polls");
db.createCollection("polls");

const pollNow = new Date();
const pollOneWeekLater = new Date(pollNow.getTime() + 7 * 24 * 60 * 60 * 1000);

const polls = [];

// 1) Wizards Nuggets reschedule poll (Sean has access but has NOT voted)
polls.push({
  calendarId: CAL.wizards,
  title: "Move pickup game vs Nuggets?",
  description: "Vote to keep the pickup game on Sat Feb 14 or move it to Sat Feb 7.",
  notes: "After Sean votes for Feb 7, Feb 7 wins.",
  startTime: dtLocal("2026-02-01T09:00:00"),
  endTime: dtLocal("2026-02-06T21:00:00"),
  resultsVisible: true,
  allowMultipleVotes: false,
  tags: ["basketball", "scheduling"],
  inviteLinks: [{ token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater }],
  optionsList: [
    { optionId: 0, description: "Keep: Saturday Feb 14", userVotes: [USER.Carlos, USER.Priya], guestVotes: [] },
    { optionId: 1, description: "Move to: Saturday Feb 7", userVotes: [USER.Ethan, USER.Mia], guestVotes: [] },
  ],
});

// 2) Sean-only poll (Sean - Juggling)
polls.push({
  calendarId: CAL.seanJuggling,
  title: "Pick next juggling routine theme",
  description: "Choose what to focus on for next week’s practice set.",
  notes: "Just a quick self-poll.",
  startTime: dtLocal("2026-01-05T18:00:00"),
  endTime: dtLocal("2026-01-09T21:00:00"),
  resultsVisible: true,
  allowMultipleVotes: false,
  tags: ["juggling", "planning"],
  inviteLinks: [],
  optionsList: [
    { optionId: 0, description: "Speed + endurance", userVotes: [USER.Sean], guestVotes: [] },
    { optionId: 1, description: "New trick: behind-the-back", userVotes: [], guestVotes: [] },
    { optionId: 2, description: "Routine cleanup", userVotes: [], guestVotes: [] },
  ],
});

// 3) Ethan-only poll (Ethan - Bowling)
polls.push({
  calendarId: CAL.ethanBowling,
  title: "Bowling focus this month",
  description: "What should we focus on during practice?",
  notes: "",
  startTime: dtLocal("2026-02-02T19:00:00"),
  endTime: dtLocal("2026-02-06T21:00:00"),
  resultsVisible: true,
  allowMultipleVotes: false,
  tags: ["bowling", "practice"],
  inviteLinks: [],
  optionsList: [
    { optionId: 0, description: "Spare shooting", userVotes: [USER.Ethan], guestVotes: [] },
    { optionId: 1, description: "Approach consistency", userVotes: [], guestVotes: [] },
  ],
});

// 4) Shared polls (both Sean & Ethan) now on Wizards
polls.push({
  calendarId: CAL.wizards,
  title: "Post-game hangout plan",
  description: "Sean + Ethan: pick what to do after the next pickup game.",
  notes: "Results visible.",
  startTime: dtLocal("2026-03-05T19:00:00"),
  endTime: dtLocal("2026-03-10T21:00:00"),
  resultsVisible: true,
  allowMultipleVotes: false,
  tags: ["friends", "planning"],
  inviteLinks: [{ token: generateToken(), createdAt: pollNow, expiresAt: pollOneWeekLater }],
  optionsList: [
    { optionId: 0, description: "Pizza", userVotes: [USER.Sean], guestVotes: [] },
    { optionId: 1, description: "Burgers", userVotes: [USER.Ethan], guestVotes: [] },
    { optionId: 2, description: "Call it a night", userVotes: [], guestVotes: [] },
  ],
});

polls.push({
  calendarId: CAL.wizards,
  title: "New practice time preference",
  description: "Should we keep Tue/Thu evening practice times or adjust?",
  notes: "",
  startTime: dtLocal("2026-01-12T18:00:00"),
  endTime: dtLocal("2026-01-16T21:00:00"),
  resultsVisible: true,
  allowMultipleVotes: true,
  tags: ["basketball", "planning"],
  inviteLinks: [],
  optionsList: [
    { optionId: 0, description: "Keep Tue/Thu 6pm", userVotes: [USER.Sean], guestVotes: [] },
    { optionId: 1, description: "Move to Mon/Wed 7pm", userVotes: [USER.Ethan], guestVotes: [] },
    { optionId: 2, description: "Weekend mornings only", userVotes: [], guestVotes: [] },
  ],
});

db.polls.insertMany(polls);
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

print("\nKey updates:");
print("  - Sean/Ethan friend calendars are private (no cross-membership).");
print("  - Wizards calendar has 3 practices/week + 2 pickup games/week (Jan–Mar), with NO events on Feb 7, 2026.");
print("  - Feb 14 Nuggets game exists; Feb 7 is intentionally empty for a potential move.");
print("✅ database seeded successfully");