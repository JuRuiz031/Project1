// db_connection.js (CommonJS for mongosh + load() compatibility)
// Replace the connection string below with your MongoDB URL.
// Examples:
//   Local: mongodb://127.0.0.1:27017/test
//   Docker w/ auth: mongodb://root:password@127.0.0.1:27017/calendario?authSource=admin
module.exports = {
  connection: "mongodb://root:password@127.0.0.1:27017/calendario?authSource=admin"
};
