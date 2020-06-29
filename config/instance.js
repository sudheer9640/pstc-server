'use strict';

const instanceName = 'prod';

switch (instanceName) {
    case "dev":
        {   
            exports.instance = "dev"
            exports.port = 9002;
            exports.secret = "poijasdf98435jpgfdpoij3";
            exports.dbUrl = "mongodb+srv://ksudheer:Pass@123@cluster0-vrkh8.mongodb.net/QData?retryWrites=true&w=majority";
        }
        break;
    case "prod":
        {
            exports.instance = "prod"
            exports.port = 9000;
            exports.secret = "pojiaj234oi234oij234oij4";
           // exports.dbUrl = "mongodb://localhost:27017/QData";
         exports.dbUrl = "mongodb+srv://ksudheer:Pass@123@cluster0-vrkh8.mongodb.net/QData?retryWrites=true&w=majority";
        }
        break;
    case "qa":
        {
            exports.instance = "qa"
            exports.port = 9001;
            exports.secret = "poijasdf98435jpgfdpoij3";
            exports.dbUrl = "mongodb://localhost:27017/QDataQA";
        }   
        break;
}

