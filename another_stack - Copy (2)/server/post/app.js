require('dotenv').config();
const express=require('express');
//const userRoutes=require('./routes/user.routes')
const dotenv=require('dotenv')
const cookieParser=require('cookie-parser')
const connect=require('./config/db')

const socketIo = require('socket.io');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');

const app=express();
//request body te data asar jonno
app.use(express.json())
app.use(express.urlencoded({extended:true}))
dotenv.config();//env or environment var use ar jonno
//to save the token in cookies
app.use(cookieParser())
connect();

/*
app.get('/',(req,res)=>{



})*/

//to connect with frontend
app.use(cors({
    origin: 'http://localhost:5173', // Set this to match your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
  

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);


app.use('/',postRoutes)

module.exports=app;