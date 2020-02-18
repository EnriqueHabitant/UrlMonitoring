const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  urlsFile: `../input/urls.txt`,
  apiSistrix: process.env.api_key_SISTRIX,

  // API Mongoose
  apiURL: `http://localhost:5050/api/einforma`,
  cesce: `http://localhost:5050/api/cesce`
}