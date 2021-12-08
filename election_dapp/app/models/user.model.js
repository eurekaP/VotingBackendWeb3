const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    luxandId:{
        type:Number,
        default:0,
        required:true
    },
    walletaccount:{
        type: String,
        required: true
    },
    verified:{
        type:Boolean,
        default:false,
        required:true
    },
});

UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true
});

module.exports = User = mongoose.model("users", UserSchema);
