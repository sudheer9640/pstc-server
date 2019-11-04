const { Subject } = require("../models/subject.model");
const { ObjectID } = require("mongodb");
const express = require("express");
const ques_specJson = require('../assets/json/question_spec.json');
const router = express.Router();

router.post("/create", async (req, res) => {
  const { subjectId } = req.body;

  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "valid subjectId is required" });
  } else {
    try {
      const question = req.body;
      const update = {
        $push: {
          questions: question
        }
      }
      const updatedSubject = await Subject.findByIdAndUpdate(
        subjectId,
        update,
        { new: true }
      )
      // console.log(updatedSubject);
      if (updatedSubject) {
        res.json({
          success: true,
          message: "Question added",
          questions: updatedSubject.questions
        });
      } else {
        return res.json({
          success: false,
          message: "Subject doesn't exists"
        });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});


router.post("/multiCreate", async (req, res) => {

  const { subject, topic, level, questions } = req.body;

  if (!subject) {
    return res.json({ success: false, message: "valid subject is required" });
  } else {
    try {
      console.log(subject)
      const subjectFound = await Subject.findOne({ subject: subject });

      // console.log(subjectFound);
      if (subjectFound) {
        let mappedQuestions = questions;
        const topicQuery = {
          _id: subjectFound._id,
          'topics.topic': topic
        }


        mappedQuestions = mappedQuestions.map(t => {
          const newt = t;
          delete newt.sNo;
          return newt;
        });

        const topicFound = await Subject.findOne(topicQuery, { _id: 0, 'topics.$': 1 });
        if (topicFound) {
          //console.log('topic found',topicFound);

          mappedQuestions = mappedQuestions.map(t => {
            const newt = t;
            newt.topic = topicFound.topics[0];
            return newt;
          });
        }

        const levelQuery = {
          _id: subjectFound._id,
          'levels.level': level
        }

        const levelFound = await Subject.findOne(levelQuery, { _id: 0, 'levels.$': 1 });
        if (levelFound) {
          // console.log('level found',levelFound);
          levelModel = levelFound.levels[0];
        }
        mappedQuestions = mappedQuestions.map(q => {
          const newq = q;
          newq.level = levelModel
          return newq;
        });
        // console.log(mappedQuestions);

        const insertedQuestions = await Subject.update({ _id: subjectFound._id },
          {
            $push: { questions: { $each: mappedQuestions } }
          });
        console.log(insertedQuestions);
        res.json({ success: true, message: 'Questions Added' });
      } else {
        console.log('Subject not found');
        res.json({ success: false, message: 'Subject not found' })
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});


router.post("/getbyCategory", async (req, res) => {
  const { subjectId, topicId, levelId } = req.body;
  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "Please send valid subjectId" });
  } else {
    try {
      // let questions = await Subject.aggregate([
      //   {
      //     $match: {
      //       _id: ObjectID(subjectId)
      //     }
      //   },
      //   {
      //     $project: {
      //       questions: 1
      //     }
      //   },
      //   {
      //     $project: {
      //       questions: {
      //         $filter: {
      //           input: "$questions",
      //           as: "questions",
      //           cond: [{ $eq: ['$$questions.level._id', ObjectID(levelId)] }]
      //         }
      //       }
      //     }
      //   }
      // ]);
 if (subjectId && topicId && levelId) {
        let questions = await Subject.aggregate([
          { $match: { _id: ObjectID(subjectId) } },
          { $project: { questions: 1 } },
          { $unwind: '$questions' },
          {
            $match: {
                'questions.topic._id': ObjectID(topicId),
                'questions.level._id': ObjectID(levelId)
            }
          },
          { $project: { _id: 0 } },
          {
            $replaceRoot: {
              'newRoot': "$questions"
            }
          }
        ]);
        res.json({ success: true, message: questions });
      } else if (subjectId && topicId) {
        let questions = await Subject.aggregate([
          { $match: { _id: ObjectID(subjectId) } },
          { $project: { questions: 1 } },
          { $unwind: '$questions' },
          {
            $match: {
                'questions.topic._id': ObjectID(topicId)
            }
          },
          { $project: { _id: 0 } },
          {
            $replaceRoot: {
              'newRoot': "$questions"
            }
          }
        ]);
        res.json({ success: true, message: questions });
      } else {
        let questions = await Subject.aggregate([
          { $match: { _id: ObjectID(subjectId) } },
          { $project: { questions: 1, _id: 0 } }
        ]);
        res.json({ success: true, message: questions[0].questions });
      }
    }
    catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.post("/update", async (req, res) => {
  const { subjectId, question } = req.body;

  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "valid subjectId is required" });
  } else {
    try {
      const query = { _id: subjectId, "questions._id": question._id };
      const update = {
        $set: {
          "questions.$": question
        }
      };

      const updatedQuestion = await Subject.findOneAndUpdate(query, update, {
        new: true
      });
      // console.log(updatedQuestion)
      if (updatedQuestion) {
        res.json({
          success: true,
          message: "Question Updated"
        });
      } else {
        res.json({
          success: false,
          message: "Question not found"
        });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.post("/delete", async (req, res) => {
  const { subjectId, questionId } = req.body;
  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "Please send valid subjectId" });
  }
  if (!questionId || !ObjectID.isValid(questionId)) {
    return res.json({
      success: false,
      message: "Please send valid questionId"
    });
  } else {
    try {
      const query = { _id: subjectId };
      const update = {
        $pull: { questions: { _id: questionId } }
      };

      const deletedQuestion = await Subject.findOneAndUpdate(query, update);
      // console.log(deletedQuestion);
      if (deletedQuestion) {
        res.json({
          success: true,
          message: "Question removed"
        });
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});

router.post("/get", async (req, res) => {
  const { subjectId, questionId } = req.body;
  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "Please send valid subjectId" });
  } else if (!questionId || !ObjectID.isValid(questionId)) {
    return res.json({ success: false, message: "Please send valid questionId" });
  } else {
    try {
      const query = { _id: subjectId, "questions._id": questionId },
        project = { "questions.$": 1 };
      const questions = await Subject.findOne(query, project);
      res.json({ success: true, message: questions });
    }
    catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});


router.post("/getAll", async (req, res) => {
  const { subjectId } = req.body;
  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "Please send valid subjectId" });
  } else {
    try {
      const query = { _id: subjectId },
        project = { "questions": 1 };
      const questions = await Subject.findOne(query, project);
      res.json({ success: true, message: questions });
    }
    catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});


router.post("/get", async (req, res) => {
  const { subjectId, questionId } = req.body;
  if (!subjectId || !ObjectID.isValid(subjectId)) {
    return res.json({ success: false, message: "Please send valid subjectId" });
  } else if (!questionId || !ObjectID.isValid(questionId)) {
    return res.json({ success: false, message: "Please send valid questionId" });
  } else {
    try {
      const query = { _id: subjectId, "questions._id": questionId },
        project = { "questions.$": 1 };
      const questions = await Subject.findOne(query, project);
      res.json({ success: true, message: questions });
    }
    catch (err) {
      console.log(err);
      res.json({ success: false, message: err });
    }
  }
});


router.get("/sampleQuestions_Spec", async (req, res) => {
  try {
    res.json({ success: true, message: ques_specJson });
  }
  catch (err) {
    console.log(err);
    res.json({ success: false, message: err });
  }
});

module.exports = router;
