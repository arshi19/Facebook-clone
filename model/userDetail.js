const mongoose = require("mongoose");

const plm = require("passport-local-mongoose");


const userModel = mongoose.Schema({

    // we can pass any value here this is a type of schema 
    // where we can save the data coming from website directly into our database
    
    username:String,
    email:String,   
    password:String,

    about:{
        type:String,
        default:"hii everyone , I am new member here !",
    },

    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "blog" }],
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "blog" }],
    avatar:{
        type:String,
        default:"dummy.jpg",
    },

    Date:{
        type:Date,
        default:Date.now,
    },

    resetToken:0,
})


userModel.plugin(plm, { usernameField : 'email' });

const userDetail = mongoose.model('userDetail',userModel);

module.exports = userDetail;