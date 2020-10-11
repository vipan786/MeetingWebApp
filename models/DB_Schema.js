var mongoose = require("mongoose");
const customerSchema= new mongoose.Schema({
    title: String,
    timing:Date,
    withw:String,

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
        ,
        username: String
    },

});

module.exports = mongoose.model("Customer", customerSchema);