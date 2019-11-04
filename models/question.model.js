const mongoose = require("mongoose");
const { Schema } = mongoose;

const Question = {
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true
  },
  options: [
    {
      option: {
        type: String,
        required: true
      },
      isAnswer: {
        type: Boolean,
        required: true
      }
    }
  ],
  timerCount: {
    type: Number,
    default: 60
  },
  level: {
    level: {
      type: Number,
      default: 1
    },
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  topic: {
    name: {
      type: String,
      default: 'Miscellaneous'
    },
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    }
  },
  quid: {
    type: String,
    unique: true
  },
  evaluated: {
    type: Boolean,
    default: false,
    required: true
  }
};

module.exports =  Question ;

