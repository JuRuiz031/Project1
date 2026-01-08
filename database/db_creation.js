const {connection} = require(`PATH TO .js FILE CONTAINING THE DATABASE STRING. FOR EXAMPLE;
    C:/Users/JohnDoe/Documents/mongodb_directory/db_connection.js
`);

db = connect(connection); 

if (!db.getCollectionNames().includes("calendars")) {
    print("adding calendars");
    db.createCollection("calendars");
    db.calendars.insertMany([
        {
            "name": "Work"
        },
        {
            "name": "Personal"
        },
        {
            "name": "Family"
        },
        {
            "name": "Fitness"
        },
        {
            "name": "Travel"
        },
        {
            "name": "School"
        },
        {
            "name": "Project Alpha"
        },
        {
            "name": "Meetings"
        },
        {
            "name": "Deadlines"
        },
        {
            "name": "Holidays"
        }
    ]);
    print("added calendars");
}

const calendarIds = db.calendars.find(
        {}, //filter by, in this case filter by nothing
        {_id: 1} //projection, get all _id from the result of this query
    ).toArray().map(c => c._id);

/*
=================================================
                    USERS
=================================================
*/
if (!db.getCollectionNames().includes("users")) {
    print("adding users");
    db.createCollection("users");


    db.users.insertMany([
    {
        username: "alice_w",
        email: "alice.w@example.com",
        password: "alicePass123",
        calendarIds: [calendarIds[0], calendarIds[1]]
    },
    {
        username: "bob_smith",
        email: "bob.smith@example.com",
        password: "bobSecure456",
        calendarIds: [calendarIds[2]]
    },
    {
        username: "charlie_k",
        email: "charlie.k@example.com",
        password: "charliePwd789",
        calendarIds: [calendarIds[3], calendarIds[4]]
    },
    {
        username: "diana_p",
        email: "diana.p@example.com",
        password: "dianaPass321",
        calendarIds: []
    },
    {
        username: "ethan_r",
        email: "ethan.r@example.com",
        password: "ethanPwd654",
        calendarIds: [calendarIds[5]]
    },
    {
        username: "fiona_l",
        email: "fiona.l@example.com",
        password: "fionaPass987",
        calendarIds: [calendarIds[6], calendarIds[7]]
    },
    {
        username: "george_m",
        email: "george.m@example.com",
        password: "georgePwd111",
        calendarIds: [calendarIds[8]]
    },
    {
        username: "hannah_t",
        email: "hannah.t@example.com",
        password: "hannahPass222",
        calendarIds: [calendarIds[9]]
    },
    {
        username: "ivan_d",
        email: "ivan.d@example.com",
        password: "ivanPwd333",
        calendarIds: []
    },
    {
        username: "julia_n",
        email: "julia.n@example.com",
        password: "juliaPass444",
        calendarIds: [calendarIds[0]]
    }
    ]);
    print("added users");
}

const userIds = db.users.find(
        {}, //filter by, in this case filter by nothing
        {_id: 1} //projection, get all _id from the result of this query
    ).toArray().map(c => c._id);
/*
=================================================
                    EVENTS
=================================================
*/
if (!db.getCollectionNames().includes("events")) {
    print("adding events");
    db.createCollection("events");

    db.events.insertMany([
    {
        calendar_id: calendarIds[0],
        title: "Team Standup",
        start: new Date("2024-10-01T09:00:00Z"),
        end: new Date("2024-10-01T09:30:00Z"),
        tags: ["work", "meeting"]
    },
    {
        calendar_id: calendarIds[0],
        title: "Sprint Planning",
        start: new Date("2024-10-02T10:00:00Z"),
        end: new Date("2024-10-02T11:30:00Z"),
        tags: ["work", "planning"]
    },
    {
        calendar_id: calendarIds[1],
        title: "Doctor Appointment",
        start: new Date("2024-10-03T15:00:00Z"),
        end: new Date("2024-10-03T16:00:00Z"),
        tags: ["personal", "health"]
    },
    {
        calendar_id: calendarIds[2],
        title: "Family Dinner",
        start: new Date("2024-10-04T18:00:00Z"),
        end: new Date("2024-10-04T20:00:00Z"),
        tags: ["family"]
    },
    {
        calendar_id: calendarIds[3],
        title: "Gym Session",
        start: new Date("2024-10-05T07:00:00Z"),
        end: new Date("2024-10-05T08:00:00Z"),
        tags: ["fitness"]
    },
    {
        calendar_id: calendarIds[4],
        title: "Flight to NYC",
        start: new Date("2024-10-06T12:00:00Z"),
        end: new Date("2024-10-06T16:00:00Z"),
        tags: ["travel"]
    },
    {
        calendar_id: calendarIds[5],
        title: "Final Exam",
        start: new Date("2024-10-07T13:00:00Z"),
        end: new Date("2024-10-07T15:00:00Z"),
        tags: ["school"]
    },
    {
        calendar_id: calendarIds[6],
        title: "Project Alpha Demo",
        start: new Date("2024-10-08T14:00:00Z"),
        end: new Date("2024-10-08T15:00:00Z"),
        tags: ["work", "project"]
    },
    {
        calendar_id: calendarIds[7],
        title: "Weekly Sync",
        start: new Date("2024-10-09T11:00:00Z"),
        end: new Date("2024-10-09T11:30:00Z"),
        tags: ["meeting"]
    },
    {
        calendar_id: calendarIds[8],
        title: "Release Deadline",
        start: new Date("2024-10-10T17:00:00Z"),
        end: new Date("2024-10-10T18:00:00Z"),
        tags: ["deadline", "work"]
    }
    ]);
    print("added events");
}
/*
=================================================
                    POLLS
=================================================
*/
if (!db.getCollectionNames().includes("polls")) {
    print("adding polls");
    db.createCollection("polls");

    db.polls.insertMany([
        {
            calendar_id: calendarIds[0],
            proposal: "Best time for weekly standup",
            description: "Vote on the best time for our weekly team standup meeting.",
            notes: "Please consider your recurring conflicts.",
            start_time: new Date("2024-10-01T00:00:00Z"),
            end_time: new Date("2024-10-03T23:59:59Z"),
            resultsVisible: true,
            allowMultipleVotes: false,
            tags: ["work", "meeting"],
            options: [
            {
                description: "Monday 9:00 AM",
                userVotes: [userIds[0], userIds[1]],
                guestVotes: ["Alice (guest)"]
            },
            {
                description: "Tuesday 10:00 AM",
                userVotes: [userIds[2]],
                guestVotes: []
            }
            ]
        },
        {
            calendar_id: calendarIds[1],
            proposal: "Choose team lunch location",
            description: "Help decide where we should go for the next team lunch.",
            notes: "",
            start_time: new Date("2024-10-05T00:00:00Z"),
            end_time: new Date("2024-10-07T23:59:59Z"),
            tags: ["social"],
            options: [
            {
                description: "Italian Restaurant",
                userVotes: [userIds[0]],
                guestVotes: ["Bob"]
            },
            {
                description: "Sushi Place",
                userVotes: [userIds[1], userIds[3]],
                guestVotes: []
            }
            ]
        },
        {
            calendar_id: calendarIds[2],
            proposal: "Select project deadline",
            description: "Finalize the deadline for Project Alpha.",
            notes: "Deadline impacts release planning.",
            start_time: new Date("2024-10-08T00:00:00Z"),
            end_time: new Date("2024-10-10T23:59:59Z"),
            resultsVisible: false,
            tags: ["project", "deadline"],
            options: [
            {
                description: "October 20",
                userVotes: [userIds[2]],
                guestVotes: []
            },
            {
                description: "October 27",
                userVotes: [userIds[0], userIds[3]],
                guestVotes: ["Charlie"]
            }
            ]
        },
        {
            calendar_id: calendarIds[3],
            proposal: "Pick fitness class",
            description: "Vote on which fitness class to attend this month.",
            notes: "",
            start_time: new Date("2024-10-11T00:00:00Z"),
            end_time: new Date("2024-10-13T23:59:59Z"),
            allowMultipleVotes: true,
            tags: ["fitness"],
            options: [
            {
                description: "Yoga",
                userVotes: [userIds[1]],
                guestVotes: []
            },
            {
                description: "Spin Class",
                userVotes: [userIds[2]],
                guestVotes: ["Dana"]
            }
            ]
        }
]);

}