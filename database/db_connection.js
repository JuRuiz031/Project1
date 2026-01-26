/**
 * MongoDB Connection Configuration
 * 
 * This connection string matches the docker-compose.yml setup:
 *   - Username: root
 *   - Password: password
 *   - Database: calendario
 *   - Auth source: admin
 * 
 * Start the database with: docker-compose up -d
 * Then run: mongosh < db_creation.js
 */
exports.connection = 'mongodb://root:password@127.0.0.1:27017/calendario?authSource=admin';
