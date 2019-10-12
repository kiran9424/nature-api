const express = require('express');
const mongoose = require('mongoose')
const morgan = require('morgan')
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const sanitize = require('express-mongo-sanitize');
require('dotenv').config()

const app = express();

const tourRoute = require('./routing/tour');
const userRoute = require('./routing/user')
const reviewRoute = require('./routing/review')

app.use(helmet());

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useCreateIndex:true}).then(()=>console.log('DB conneceted successully'));

const limit = rateLimiter({
    windowMs:60*60*1000,
    max:100,
    message:"Too many requests from this IP, Please try after one hour"
});

app.use(express.json());
app.use(morgan('dev'));
app.use('/api',limit);
app.use(xss());
app.use(sanitize());

app.use('/api/v1',tourRoute);
app.use('/api/v1',userRoute);
app.use('/api/v1',reviewRoute);

const port = process.env.PORT||3000

app.listen(port,()=>console.log(`Running on port ${port}`))