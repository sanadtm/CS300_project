const express = require('express')
const app = express()
const port = 3000
const bcrypt = require('bcrypt')
const passport = require('passport')
const authenticateUser = require("./middleware/authenticateUser")
const flash = require('express-flash')



//const users =[]
app.set('view-engine','ejs')
//app.use(router);
require("dotenv").config();
const mongoose = require("mongoose");
const { Router } = require('express')

mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

mongoose.connection.on("error",(err)=>{
    console.log("Mongoose Connection ERROR:" + err.message);
});

mongoose.connection.once("Open",()=>{
    console.log("MongDB CONNECTED");
});
app.use(express.urlencoded({ extended: false})); //Body Parser


// GET REQUEST
app.get('/', (req, res) => {
    res.render('register.ejs', {name :'Sanad'});
  });
  app.get('/login', (req, res) => {
    res.render('login.ejs');
  });
  app.get('/register', (req, res) => {
    res.render('register.ejs');
  });

  app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  app.get("/home", (req, res) => {
    res.render("index.html");
  });
  
//app.use('/users', require('./routes/User.js'));

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


const N_user= require("./model/add_users");
// const N_user = mongoose.model("db_user");

// POST REQUEST  
// LOGIN
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await N_user.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }
    const name=  doesUserExits.name;
    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }
    
    res.render("chat.ejs" , {name:name});
  });
//REGISTER
  app.post('/register', async (req, res) => {
    const email = req.body.email;
    const doesUserExits = await N_user.findOne({ email });
    if (doesUserExits) {
      res.send("Email is already Taken Or You already have an ACCOUNT");
      return;
    }else{
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        const newUser = new N_user({
          name:req.body.name,
          email:req.body.email,
          password:hashedPassword
        });
      
        newUser.save()
        .then(() => {
          res.send("registered account!");
          return;
        })
        .catch((err) => console.log(err));
      } 
  });

const io = require('socket.io')(server);
require("./model/Message")
const Message = mongoose.model("Message");
let numUsers = 0;
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.broadcast.emit('message', 'A USER has joined');
  
    socket.on('chat message', (msg) => {
      
        io.emit('chat message', msg);

        const newMessage = new Message({
          message:msg
        })
        newMessage.save();
      });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('message', 'A USER has LEFT!!');
    });
  });


