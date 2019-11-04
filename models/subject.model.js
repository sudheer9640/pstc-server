const mongoose = require("mongoose");
const { Schema } = mongoose;
const Question = require('./question.model');

const subjectSchema = new Schema({
  subject: {
    type: String,
    required: true,
    unique: true
  },
  topics: [
    {
      topic: {
        type: String,
        required: true,
        default: 'Miscellaneous',
        unique: true
      }
    }
  ],
  levels: [{
    level: {
      type: Number,
      default: 1,
      required: true,
      unique: true
    }
  }],
  questions: [Question],
  tags: {
    educations: [
      {
        education: {
          type: String,
          required: true,
          unique: true
        }
      }
    ],
    courses: [
      {
        course: {
          type: String,
          required: true,
          unique: true
        }
      }
    ]
  }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = { Subject };
