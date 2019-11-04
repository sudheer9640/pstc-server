const { Subject } = require("../models/subject.model");
const ObjectID = require("mongodb").ObjectID;
const express = require("express");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { subject, levels, topics, tags } = req.body;
  if (!subject && !levels && !topics) {
    res.json({ success: false, message: "Valid Subject, Levels and Topics are required" });
  } else {
    try {
      const query = { subject: subject };
      const subjectexits = await Subject.findOne(query);
      // console.log(subjectexits)
      if (!subjectexits) {
        const newSubjectModel = new Subject({
          subject: subject,
          topics: topics,
          levels: levels,
          tags: { 
            education: tags.education,
            course: tags.course
          }
        })

        const newSubject = await newSubjectModel.save();
        // console.log(newSubject);
        if (newSubject) {
          res.json({
            success: true,
            message: "Subject added",
            subject: newSubject
          });
        } else {
          res.json({
            success: false,
            message: "Unable to add Subject"
          });
        }
      } else {
        console.warn('Subject exits already');
        res.json({
          success: false,
          message: "Subject exists already"
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ success: false, message: err });
    }
  }
});

router.post("/update", async (req, res) => {
  const { subjectId, subject, topics, levels, tags } = req.body;

  if (!subjectId && !subject && !topics && !levels && !tags) {
    res.json({ success: false, message: "valid subjectId is required" });
  }

  try {
    const query = {
      _id: subjectId
    }
    const updateModel = {
      subject: subject,
      topics: topics,
      levels: levels,
      tags: tags
    }

    const updatedSubject = await Subject.findByIdAndUpdate(query, updateModel, {
      new: true
    });
    // console.log(updatedSubject);
    if (updatedSubject) {
      res.json({
        success: true,
        message: "Subject Updated",
        subject: updatedSubject
      });
    } else {
      res.json({
        success: false,
        message: "Unable to update Subject"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err });
  }
});

router.post("/delete", async (req, res) => {
  const { sessionId, contentId } = req.body;
  if (!sessionId || !ObjectID.isValid(sessionId)) {
    return res.json({ success: false, message: "Please send valid sessionId" });
  }
  if (!contentId && !ObjectID.isValid(contentId)) {
    return res.json({ success: false, message: "Please send valid contentId" });
  } else {
    try {
      const query = { _id: sessionId };
      const update = {
        $pull: { contents: { _id: contentId } }
      };

      const updatedSession = await Session.findOneAndUpdate(query, update, { new: true });
      if (updatedSession) {
        // console.log(updatedSession);
        res.json({
          success: true,
          message: "Content removed"
        });
      } else {
        res.json({ success: false, message: "Unable to delete Content" });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.get("/", (req, res) => {
  Subject.find({}, { questions: 0 })
    .then(subjects => {
      // console.log(subjects);
      res.json({
        success: true,
        message: subjects
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({ success: false, message: err });
    });
});

router.get("/subjectNames", async (req, res) => {
  const project = { questions: 0, __v: 0, createdAt: 0, updatedAt: 0 }
  try {
    const subjects = await Subject.find({}, project)
    // console.log(subjects);
    res.json({ success: true, message: subjects })
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err });
  }
});

module.exports = router;
