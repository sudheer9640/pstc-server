const { UserMessage } = require('../models/userMessage');
const { liveUpdate } = require('../models/liveUpdate');
const { Session } = require("../models/session");
const express = require("express");
const router = express.Router();

router.get("/unaccepteduserMessages", async (req, res) => {
    try {
      const query = { status: { $exists: false } }
      const unaccepteduserMessages = await  UserMessage.find(query);
      if (unaccepteduserMessages) {
        res.json({success: true, message: unaccepteduserMessages});
      }
    } catch (err) {
      console.log(err)
      res.status(400).json({ success: false, message: err });
    }
});

router.post("/liveUpdates", async (req, res) => {
  try {
    console.log(req.body.sessionId);
    if(req.body.sessionId){
    await Session.find({_id:req.body.sessionId}).then(async function(session){
      console.log(session[0].sessionName+"ppppppppppp");
      const liveUpdates = await  liveUpdate.find({sessionId:req.body.sessionId}).sort({'createdAt':'desc'});
      if (liveUpdates) {
        res.json({success: true, message: liveUpdates,sessionName:session[0].sessionName});
      }
    })
  }
  else{
    res.json({success: false, message: 'provide SessionId'});

  }
   
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err });
  }
});

module.exports = router;
