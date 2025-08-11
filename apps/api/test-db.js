require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'chashier',
  password: process.env.DB_PASS || 'chashier',
  database: process.env.DB_NAME || 'chashier',
  ssl: false,
});

client.connect()
  .then(() => client.query('select current_user, current_database();'))
  .then(r => console.log(r.rows[0]))
  .catch(err => console.error('DB TEST ERROR:', err))
  .finally(() => client.end());