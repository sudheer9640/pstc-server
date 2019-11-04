const moment = require('moment');
const nodemailer = require("nodemailer");
const { User } = require("../models/user");
const { UserMessage } = require('../models/userMessage');
const instance = require("../config/instance");
const express = require("express");
const passport = require("passport"),
  router = express.Router(),
  jwt = require("jsonwebtoken");

/*********************  Middleware *****************************************/
function middlewareForReg(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({
      status: false,
      message: "Please send all details needed for registration"
    });
  } else {
    next();
  }
}

/**************************************************************/
router.post("/register", middlewareForReg, async (req, res) => {
  const { email, password, role, userName } = req.body;
  let roleexists;
  const emailexists = await User.findOne({ email: email });
  if (role && role !== 'user') {
    roleexists = await User.findOne({ role: role });
  }

  const usernameexists = await User.findOne({ userName: userName })

  if (emailexists) {
    res.json({ success: false, message: "Email already taken" });
  } else if (roleexists) {
    res.json({ success: false, message: "Role already taken" });
  } else if (usernameexists) {
    res.json({ success: false, message: "UserName already taken" });
  } else {
    var newUser = new User(req.body);
    newUser.password = newUser.generateHash(password);
    await newUser.save();
  //nodemailer
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure:true,
    auth :{
            user:'',
            pass: '***'
    }
});
let mailOptions = {
    from: 'COMPANY <company@mail.com>',
    to: req.body.email,
    subject: "Hello",
    html: `<div className="email">
    <p>Dear ${req.body.name},</p>

    <p>Thank you for registering with Convergence of technologies that will shape the 
      future: Dialogue with a Difference.</p>

      <p>Your ID: ${req.body.email}</p>
      <p>Your password: ${req.body.password}</p>

      <p>We recommend that you save this password on your mobile/ the device you are likely to 
      carry to the event so you can participate in live polls and receive live updates of the 
      event.</p>

      <p>Do lookout for weekly updates on our website <a href="http://ftf.wowso.me" target="_blank">ftf.wowso.me</a></p>

      <p>We look forward to seeing you there!</p><br/>

      <p>Warm Regards</p>
      <p>Team Wowsome</p>
      </div>`,
};


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
res.status(400).json({success:false, message:"Error in sending Mail"});
}else{
  console.log(info);
                      res.status(200).json({success:true, message:"Mail Sent Successfully"});
      }
});
    
  }
});

/**************************************************************/
router.post("/login", async (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (user) {
      req.login(user, { session: false }, async err => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          // console.log(new Date(moment().format())-new Date(user.lastLoginTime))
          var timeinSec=(new Date(moment().format())-new Date(user.lastLoginTime))/1000
          if(user.lastLoginTime===null || !user.lastLoginTime || timeinSec>18*60*60){
          user.lastLoginTime=new Date(moment().format());
          await user.save();
        
          const token = jwt.sign(user.toJSON(), instance.secret, { expiresIn: '18h' });
        
            // businessArea.set('name', 'John');
            if(user.role==='moderator'){
              return res.header("x-auth", token).send({
                token:token,
                success: true,
                projectInfo:result,
                role: user.role,
                userId: user._id,
                userName: user.userName,
                data: analyticData,
                message: "Logged in successfully"
              });
            }
          }
        else{
          return res.json({ success: false, message: "This account is already in use" });
        }
      }
      });
    } else if (err) {
      return res.json({ success: false, message: err });
    } else if (info) {
      return res.json({ success: false, message: info });
    }
  })(req, res);
});

/**************************************************************/
router.get("/lastAcceptedMessage", async (req, res) => {
  try {
    const query = { status: 'accept' }
    const lastAcceptedMessage = await UserMessage.findOne(query).sort({ createdAt: -1 });
    if (lastAcceptedMessage) {
      res.json({ success: true, message: lastAcceptedMessage });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err });
  }
});


/**************************************************************/
router.get("/get", async (req, res) => {
  const projection = { email: 1 };
  const users = await User.find({}, projection);
  if (users) {
    res.send({ success: true, message: users });
  }
});

/**************************************************************/
router.post("/logout", async (req, res) => {
  try{
  console.log('llllllllllll',req.body.userId);
  User.findOne({_id:req.body.userId}).then(async user =>{
     user.lastLoginTime=null;
    await user.save();
    req.logout();
    res.json({ success: true, message: "Logged Out successfully" });
  })
}catch (err) {
  console.log(err)
  res.status(400).json({ success: false, message: err });
}
  
});

module.exports = router;
