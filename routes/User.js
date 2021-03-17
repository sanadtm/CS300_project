const express= require('express');
const router = express.Router();

// Login PAGE
router.get('/login', (req, res)=> res.send('login'));

router.get('/register', (req, res)=> res.send('register'));


