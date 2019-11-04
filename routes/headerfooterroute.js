const { headerFooter } = require("../models/headerfooter");

const express = require("express");
const router = express.Router();

router.post("/add", (req, res) => {
 // const { headerUrl, footerUrl, copyRight } = req.body;
  headerFooter
    .update({}, { $set: req.body }, { upsert: true, new: true })
    .then(updated => {
      //  console.log(updated);
      res.send({success: true, message: 'Updated'});
    })
    .catch(err => {
        console.log(err);
        res.send({success: false, message: err});
    })
});

router.get("/", (req, res) => {
  // const { headerUrl, footerUrl, copyRight } = req.body;
   headerFooter.findOne().then(hf => {
       //  console.log(hf);
       res.send({success: true, message: hf});
     })
     .catch(err => {
         console.log(err);
         res.send({success: false, message: err});
     });
 });

module.exports = router;
