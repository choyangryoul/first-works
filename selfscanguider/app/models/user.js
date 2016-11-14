var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema( {
    username: String,
    useremail: String,
    userbookinfo: Array,
    stTime: Date,
    edTime: Date,
    totalCost: Number,

})