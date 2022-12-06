const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const v1 = require('./routes');
const { baseRouter } = require('./routes/v1/index');
const { globalErrorHandler } = require('./controllers');
const swaggerUi = require('swagger-ui-express');
const swaggerDocumentation = require('./utilities/documentation');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const {
  generateFinalEventsDates,
} = require('./services/generateFinalEventDate');
const corsOptions = require('./config/corsOptions');
<<<<<<< HEAD
=======
require('./middlewares/googleAuth');
>>>>>>> Add new origin

// create an express app
const app = express();

cron.schedule('0 1 * * *', async () => {
  console.log('Running a task every midnight (1:00 am)');
  await generateFinalEventsDates();
});

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api-docs', swaggerUi.serve);
app.use('/api-docs', swaggerUi.setup(swaggerDocumentation));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(morgan('dev'));

// app.use(passport.initialize());
// require('./middlewares/passport');
// routes
app.use('/api/v1', v1);
app.use('/', baseRouter);

app.use(globalErrorHandler);
module.exports = app;
