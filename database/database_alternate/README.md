# Database Alternate – MongoDB Reset & Seed Toolkit

This folder provides a reliable way to **wipe and reseed** the Calendario MongoDB database using two files:

- `db_connection.js` – connection configuration
- `db_creation.js` – drop + recreate + insert data

## Folder Structure
```
database/database_alternate/
├── db_connection.js
└── db_creation.js
```

## How it works
`mongosh` loads `db_creation.js`, which imports the connection string from `db_connection.js`, connects to MongoDB, drops the database, and recreates all collections with dummy data.

## Step 1 — Configure connection
Edit `db_connection.js`:

```js
module.exports = {
  connection: "mongodb://root:password@127.0.0.1:27017/calendario?authSource=admin"
};
```

Use the same DB your Docker container / VS Code plugin uses.

## Step 2 — Set absolute path in db_creation.js
At the top of `db_creation.js`:

```js
const { connection } = require("E:/FULL/PATH/TO/database/database_alternate/db_connection.js");
```

Use forward slashes.

## Step 3 — Run
```bash
mongosh
```

```js
load("E:/FULL/PATH/TO/database/database_alternate/db_creation.js")
```

## Step 4 — Verify
```js
db.getName()
db.calendars.countDocuments()
db.users.countDocuments()
db.events.countDocuments()
db.polls.countDocuments()
```

Expected:
- calendars: 10
- users: 10
- events: 10
- polls: 4

## Warning
This script runs `db.dropDatabase()` — never point it at production.
