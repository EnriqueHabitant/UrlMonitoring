const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const URI = 'mongodb://localhost:27017/Monitoring';
dotenv.config();

const app = express();

// Db connection
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(db => console.log('Db is connected'))
  .catch(error => console.error(error));

// Settings 
app.set('port', 5050);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json({limit:1024*1024*20, type:'application/json'}));
app.use(bodyParser.urlencoded({extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoding' }));

// Routes
app.use('/api/einforma', require('./routes/einforma.routes'));
app.use('/api/cesce', require('./routes/cesce.routes'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));;

// Starting the server
app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
});