const { Session } = require("../models/subject.model");
const { ObjectID } = require('mongodb').ObjectID;
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

const technologies = [
  'Augmented Reality',
  'Virtual Reality',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Analytics', 'Others,please specify'
];

const businessAreas = [
  'Human Resource',
  'Sales',
  'Marketing',
  'Customer Service Support',
  'Operations',
  'Accounting and Finance',
  'Legal',
  'Production', 'Distribution', 'R&D', 'Administrative', 'Management', 'IT Support', 'Procurement', 'Others,please specify'
];
const locat = [
  'Mumbai',
  'New Delhi',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Kochi',
  'Pune',
  'Trivandrum',
  'Chandigarh',
  'Ahmedabad',
  'Indore',
  'Noida',
  'Goa',
  'Calicut',
  'Vizag',
  'Coimbatore'
];

const industries = [
  'IT & ITES',
  'Healthcare',
  'Advanced Engineering and Manufacturing',
  'Lifesciences',
  'Creative Industries',
  'Financial Services', 'Infrastructure', 'Retail', 'Education', 'Others,please specify'
];

const markets = [
  'US',
  'UK',
  'European Union',
  'Middle East',
  'Latin America', 'Asia Pacific', 'Australia and New Zealand', 'African Union', 'Others,please specify'
];
router.get("/analyticData", async (req, res) => {
  try {
    const userList = await User.find({ role: 'user' });
    var businessArea = new Map();
    var market = new Map();
    var industry = new Map();
    var technology = new Map();
    var location = new Map();

    for (let person of userList) {
      for (let bussiness of person.businessArea) {
        if (businessAreas.indexOf(bussiness) == -1) {
          bussiness = "Others"
        }
        if (businessArea.has(bussiness)) {
          businessArea.set(bussiness, businessArea.get(bussiness) + 1);
        }
        else {
          if (bussiness !== '')
            businessArea.set(bussiness, 1);
        }
      }
      for (let mark of person.market) {
        if (markets.indexOf(mark) == -1) {
          mark = "Others"
        }
        if (market.has(mark)) {
          market.set(mark, market.get(mark) + 1);
        }
        else {
          market.set(mark, 1);
        }
      }
      for (let indus of person.industry) {
        if (industries.indexOf(indus) == -1) {
          indus = "Others"
        }
        if (industry.has(indus)) {
          industry.set(indus, industry.get(indus) + 1);
        }
        else {
          industry.set(indus, 1);
        }
      }
      for (let tech of person.technology) {
        if (technologies.indexOf(tech) == -1) {
          tech = "Others"
        }
        if (technology.has(tech)) {
          technology.set(tech, technology.get(tech) + 1);
        }
        else {
          technology.set(tech, 1);
        }
      }
      if (locat.indexOf(person.locationData) == -1) {
        person.locationData = "Others";
      }
      if (location.has(person.locationData)) {
        location.set(person.locationData, location.get(person.locationData) + 1)
      }
      else {
        location.set(person.locationData, 1)

      }
    }
    console.log(businessArea);
    console.log(market);
    console.log(industry);
    console.log(technology);
    console.log(location);
    var analyticData = {
      businessArea: [],
      market: [],
      industry: [],
      technology: [],
      location: []
    };
    for (var [key, value] of businessArea) {
      analyticData.businessArea.push({ name: key, value })
    }
    for (var [key, value] of market) {
      analyticData.market.push({ name: key, value })
    }
    for (var [key, value] of industry) {
      analyticData.industry.push({ name: key, value })
    }
    for (var [key, value] of technology) {
      analyticData.technology.push({ name: key, value })
    }
    for (var [key, value] of location) {
      analyticData.location.push({ name: key, value })
    }
    res.json({ success: true, analyticData });

  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err });
  }
});

router.post("/create", async (req, res) => {
  // console.log(req.body);
  const { sessionName } = req.body;
  if (!sessionName) {
    res.json({ success: false, message: "Please send sessionName" });
  }
  try {
    await Session.findOne({ sessionName: sessionName }).then(async function (sessionexists) {
      if (sessionexists) {
        res.json({ success: false, message: "sessionName exists already" });
      } else {
        const session = new Session(req.body);
        await session.save();
        res.json({ success: true, message: "Session created" });
      }
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
});
router.get("/getUserData", async (req, res, next) => {
  try {
    await User.find({ role: "user" }).then(function (userData) {
      if (userData) {
        res.json({ success: true, userList: userData });
      }
      else {
        res.json({ success: false, message: "error getting data" });

      }
    })
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
})
router.get("/getPollData", async (req, res, next) => {
  try {
    await Session.find().then(async function (sessionexists) {
      if (sessionexists) {
        const sessionlist = [];
        await sessionexists.forEach(async (sess, index) => {
          const sessionDetails = [];
          //  sessionlist.sessionData=sess.sessionName;
          await sess.questions.forEach(async (quest, index) => {
            let questionData = {};
            questionData.optionList = [];
            await quest.options.forEach(async (opt, index) => {
              let optionData = {};
              optionData.userList = opt.userData;
              optionData.option = opt.option;
              await questionData.optionList.push(optionData);
            })
            questionData.question = quest.question;
            await sessionDetails.push(questionData);
          })
          let sessionObj = {};
          sessionObj.name = sess.sessionName;
          sessionObj.sessionDetails = sessionDetails
          await sessionlist.push(sessionObj);

        })
        res.json({ success: true, message: sessionlist });
      } else {

        res.json({ success: false, message: "No session exists" });
      }
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
});

router.post("/update", async (req, res) => {
  const { sessionId, sessionName } = req.body;
  if (!sessionId || !ObjectID.isValid(sessionId)) {
    res.json({ success: false, message: "Please send sessionId" });
  }
  if (!sessionName) {
    res.json({ success: false, message: "Please send sessionName" });
  } else {
    try {
      const query = { _id: sessionId };
      const update = { $set: { sessionName: sessionName } };

      const sessionexists = await Session.findOne({ sessionName: sessionName });
      if (sessionexists) {
        res.json({ success: false, message: "sessionName exists already" });
      } else {
        const updatedDoc = await Session.findOneAndUpdate(query, update, {
          projection: { sessionName: 1 },
          new: true
        });

        if (updatedDoc) {
          res.json({
            success: true,
            sessionName: updatedDoc,
            message: "Session Updated"
          });
        } else {
          res.json({ success: false, message: "Session not found" });
        }
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.post("/delete", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId || !ObjectID.isValid(sessionId)) {
    return res.json({ success: false, message: "Please send sessionId" });
  } else {
    try {
      const deleted = await Session.findByIdAndDelete(sessionId);
      if (deleted) {
        res.json({ success: true, message: "Session deleted" });
      } else {
        res.json({ success: false, message: "Session not found" });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.get("/get", async (req, res) => {
  try {
    const sessions = await Session.find();
    if (sessions) {
      // console.log(sessions);
      res.json({ success: true, message: sessions });
    } else {
      res.json({ success: false, message: "Unable to get Sessions" });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
});

module.exports = router;
