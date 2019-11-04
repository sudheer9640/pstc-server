const jwt = require("jsonwebtoken");

const retriveToken = req => {
 return new Promise((resolve, reject) => {
    const header = req.headers["authorization"];
    if (header) {
      const bearer = header.split(" ");
      const token = bearer[1];
      if (token) {
       resolve(token);
      } else {
      reject("Access token invalid" );
      }
    } else {
      reject("Unauthorized");
    }
  });
};

const checkRole = (token, role) => {
  return new Promise((resolve, reject) => {
  jwt.verify(token, instance.secret, (err, authorizedData) => {
    if (err) {
      // console.log(err);
      if (err.message === "jwt expired") {
        reject("Session expired");
      } else {
       reject(err.message);
      }
    } else {
      if (authorizedData.role === role) {
       resolve();
      } else {
        reject("Access denied");
      }
    }
  });
});
}

const isAdmin = (req, res, next) => {
 // console.log("LOGGED");

  retriveToken(req).then(token => {
  // console.log(token);
   checkRole(token , 'admin').then(() => {
    next();
   })
    .catch(err => {
      console.log(err);
      res.json({success: false, message: err})
    })
  })
  .catch(err => {
    console.log(err);
    res.json({success: false, message: err})
  })
};

const isBlogger = (req, res, next) => {
//  console.log("LOGGED");

  retriveToken(req).then(token => {
  // console.log(token);
   checkRole(token , 'blogger').then(() => {
    next();
   })
    .catch(err => {
      console.log(err);
      res.json({success: false, message: err})
    });
  })
  .catch(err => {
    console.log(err);
    res.json({success: false, message: err})
  });
};


module.exports = { isAdmin, isBlogger };
