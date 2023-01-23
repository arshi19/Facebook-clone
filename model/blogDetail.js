
const mongoose = require("mongoose");

const blogModel = new mongoose.Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:"userDetail"},
    createdAt:{
        type:Date,
        default:Date.now,
    },
    blog:Array,
})

const Blog = mongoose.model("Blog",blogModel);

module.exports = Blog;