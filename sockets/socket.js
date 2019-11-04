const { Session } = require("../models/subject.model");
const { User } = require("../models/user");
const { UserMessage } = require("../models/userMessage");
const { liveUpdate } = require("../models/liveUpdate");
var ioInstance;
var currentPollOrContent = {};
var sharedSession="";

module.exports = io => {
  ioInstance = io;
  io.on("connection", function (socket) {
    console.log("made socket connection", socket.id);
    socket.on("join", function (data) {
      console.log(data, socket.id);
      if (currentPollOrContent) {
        socket.emit("newJoin", currentPollOrContent);
      }
      else{
        let obj={};
        obj.type='displayDefault';
        socket.emit("newJoin", obj);
       }
    });

    socket.on("startPollOrContent", function (data) {
      // console.log(data);
      currentPollOrContent = data;
      io.emit("newPollOrContent", data);
    });

    socket.on("stopCasting", function (data) {
      currentPollOrContent = {};
      io.emit("stopCastingToUser", data);
    })
    socket.on("stopPollOrContent", function (data) {
      currentPollOrContent = {};
      if (data && data.type == "poll") {
        Session.findOne(
          { _id: data.sessionId, "questions._id": data.question._id },
          { "questions.$": 1 }
        )
          .then(question => {
            // console.log('hii', question);
            if (question) {
              if (question.questions) {
                if (question.questions[0]) {
                  const emitdata = {
                    question: question.questions[0],
                    _id: question._id,
                    type: data.type
                  };
                  let body={};
                  body.type='pollData';
                  body.question=emitdata.question
                  currentPollOrContent=body;
                  // console.log(emitdata);
                  io.emit("newStopPollOrContent", emitdata);
                }
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else if (data && data.type == "content") {
        const emitdata = { type: data.type };
        io.emit("newStopPollOrContent", emitdata);
      }
    });

    socket.on("liveUpdate", function (data) {
      //  console.log("new live update");
      console.log(data);
      const { update, timestamp,sessionId,messageType,messageId } = data;
    if(messageType==='create'){
      if (update && timestamp) {
        let newLiveUpdate = new liveUpdate({
          update: update,
          timestamp: timestamp,
          sessionId:sessionId
        });

        newLiveUpdate
          .save()
          .then(() => {
            liveUpdate
              .find({sessionId:sessionId})
              .sort({ $natural: -1 })
              .then(lastthree => {
                io.emit("newLiveUpdate", lastthree);
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
    else{
      liveUpdate.findByIdAndDelete(messageId).then(()=>{
        liveUpdate
        .find({sessionId:sessionId})
        .sort({ $natural: -1 })
        .then(lastthree => {
          io.emit("newLiveUpdate", lastthree);
        })
        .catch(err => {
          console.log(err);
        });
      })  
      .catch(err => {
        console.log(err);
      });
    }
    });

    socket.on("DeleteBlog", function (index) {
      // blogger.splice(index, 1);
      io.emit("BloggerUpdates", blogger);
    });

    socket.on("SessionHighlights", function (data) {
      // ToggleSessionHighLights = data;
      //  console.log("emit hightlights:", data);
      if(data.length>0){
        let body={};
        body.type='highlights'
        body.highlights=data;
        currentPollOrContent=body;
      }
      io.emit("Highlights", data);
    });
    socket.on("sessionDetails",function(data){
      console.log(data);
      sharedSession=data.sessionId;
      io.emit("bloggerSessionDetails",data);
    })

    socket.on("HandleUsermessage", function (data) {
      let { id, status } = data;
      //  console.log("new id from ramappa 1=>", id, status);
      let update = { $set: { status: status } };
      UserMessage.findByIdAndUpdate(id, update)
        .then(doc => {
          //  console.log("new id from ramappa=>", id, update);
        })
        .then(() => {
          // console.log("in find id=>", id);
          UserMessage.findById(id)
            .then(lastUserAcceptedMessage => {
              // console.log("lastUserAcceptedMessage ramappa=>",lastUserAcceptedMessage);
              if (status == "accept") {
                io.emit("BloggerAccepted", lastUserAcceptedMessage);
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });

    socket.on("UpdateSession", function (session) {
      //ToggleCurrentSession = session;
      //  console.log("published session", session);
      io.emit("CurrentSession", session);
    });

    socket.on("userMessage", function (data) {
      let { userName, message, timestamp } = data;

      let newUserMessage = new UserMessage({
        userName: userName,
        message: message,
        timestamp: timestamp
      });

      newUserMessage
        .save()
        .then(() => {
          console.log("user messages saved:");
          UserMessage.find({ status: { $exists: false } })
            .then(message => {
              io.emit("UserUpdates", message);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });

    socket.on("UserOpinionPoll", function (data) {
      // AutoformScoopOrders.find({'scoopItems.scoopId': doc._id})
      //              .forEach(function(order){
      //                  AutoformScoopOrders.update(
      //                      {_id: order._id, 'scoopItems.scoopId': doc._id},
      //                      {$set: { 'scoopItems.$.scoopInstance': doc }}
      //                  )
      //              });

      const { sessionId, questionId, optionIds, userId, userName } = data;
      // console.log(sessionId, questionId, optionId, userId);
      if ((sessionId, questionId, optionIds, userId)) {
        const query = {
          _id: sessionId,
          "questions._id": questionId
        };
        const update = {
          // $inc: { "questions.0.options.$.votes": 1 },
          $push: { "questions.$.participated": userId }
        };
        User.find({ _id: userId }).then(function (user) {
          Session.findOne(query).then(session => {
            // console.log(session);
            let optionsCount = 0;
            if (session) {
              if (session.questions) {
                // console.log('first hiii');
                session.questions.forEach((question, qIndex) => {
                  // console.log('hiii22',qIndex, question , questionId);
                  if(question)
                  if (question._id == questionId) {
                    session.questions[qIndex].participated.push(userId);
                    // console.log(question);
                    if (question.options) {
                      optionIds.forEach(optionId => {
                        question.options.forEach((option, oIndex) => {
                          optionsCount++;
                          if (option._id == optionId) {
                            const incVotes = option.votes + 1;
                            session.questions[qIndex].options[
                              oIndex
                            ].votes = incVotes;
                            session.questions[qIndex].options[
                              oIndex
                            ].voteIds.push(userId);
                            if (user[0]) {
                              delete user[0].password;
                              session.questions[qIndex].options[
                                oIndex
                              ].userData.push(user[0]);
                            }
                          }

                          if (
                            optionsCount ===
                            optionIds.length * question.options.length
                          ) {

                            session
                              .save()
                              .then(doc => {
                                if (doc) {
                                  const emitData = {
                                    _id: session._id,
                                    questions: session.questions
                                  };
                                  io.emit("newUserOpinion", emitData);
                                }

                              })
                              .catch(err => {
                                console.log(err);
                              });
                          }
                        });
                      });
                    }
                  }
                });
              }
            }
          });
        })

      }
    });

    socket.on("disconnect", () => console.log("Client disconnected"));
  });
};

module.exports.addnewPollorContent = uSession => {
  //  console.log("newpoll", uSession);
  if (ioInstance) {
    return new Promise((resolve, reject) => {
      ioInstance.emit("liveSessionUpdate", uSession);
      resolve();
    });
  }
};
module.exports.getSessionId = uSession => {
  //  console.log("newpoll", uSession);
  if (ioInstance) {
    return new Promise((resolve, reject) => {
      resolve(sharedSession);
    });
  }
};

module.exports.isnotCurrentPollorContent = contentorPollId => {
  //  console.log("newpoll");
  console.log(contentorPollId, currentPollOrContent);
  return new Promise((resolve, reject) => {
    if (currentPollOrContent && currentPollOrContent.data) {
      if(currentPollOrContent && currentPollOrContent.data && currentPollOrContent.data._id )
      if (currentPollOrContent.data._id !== contentorPollId) {
        resolve(true);
      } else {
        console.log('reject')
        reject("Current Poll or Session is being shared");
      }
    }
    else {
      console.log('fresh content')
      resolve(true);
    }
  });
};
