const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        minlength: 3,
        maxlength: 20
    },

    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        validate: [validator.isEmail, "please provide valid email"],
        lowercase: true
    },

    password: {
        type: String,
        required: [true, 'password is required']
    },

    confirmPassword: {
        type: String,
        required: true[true, 'confirm paswword is required'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "password and confirm password should match"
        }
    },
    roles: {
        type: String,
        enum: ['admin', 'user', 'owner'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true
    }
})

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined;
    next();
})
userSchema.methods.comparePassword = async function (userEnteredPassword, hashedPassword) {
    return await bcrypt.compare(userEnteredPassword, hashedPassword)
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
    return resetToken;
}

//to find users only those who are active
userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
})
module.exports = mongoose.model('User-Test', userSchema);