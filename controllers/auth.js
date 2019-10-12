const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendmail = require('../utils/email');
const crypto = require('crypto');

exports.signup = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        const newUser = { id: user._id, name: user.name, email: user.email }
        const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        console.log(token);

        res.status(201).json({ status: "success", token, user })
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error })

    }


}

exports.signin = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ status: "fail", message: "user not found" });
        }

        const checkPassword = await user.comparePassword(req.body.password, user.password);
        if (!checkPassword) {
            return res.status(400).json({ status: "fail", message: "email id or password is incorrect" });
        }
        const newUser = { id: user._id, name: user.name, email: user.email }
        const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie('auth', token, {
            expiresIn:
                new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
        })
        res.status(200).json({ status: "success", token })
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error })
    }

}

exports.checkForAuthorizedUsers = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
       
    }
    if (!token) {
        res.status(403).json({ status: 'fail', message: 'Your not authorized....Please login' })
    }
    const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findOne({ _id: decodedToken.id })
    if (!currentUser) {
        res.status(403).json({ status: 'fail', message: 'user not found' })
    }



    req.user = currentUser;
    next();
}

exports.checkRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) {
            return res.status(403).json({ status: "fail", message: "your not authorized to access this page" })
        }

        next();
    }

}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ status: "fail", message: "user not found" });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/:${resetToken}`
    const message = `Please use the link to reset the password ${resetUrl}`;

    try {
        await sendmail({
            email: user.email,
            subject: 'Reset Password',
            message
        })

        res.status(200).json({ status: "success", message: "mail has been sent to reset password" });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return res.status(400).json({ status: "fail", message: error })
    }

}

exports.resetPassword = async (req, res, next) => {
    try {
        const hashedPassword = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({ passwordResetToken: hashedPassword, passwordResetExpires: { $gt: Date.now() } })
        if (!user) {
            return res.status(400).json({ status: "fail", message: "user not found" });
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save()
        const newUser = { id: user._id, name: user.name, email: user.email }
        const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ status: "succcess", message: "password has been reset please login", token })
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error })
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");
        if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
            return res.status(403).json({ status: "fail", message: 'current password is incorrect' })
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();
        const newUser = { id: user._id, name: user.name, email: user.email }
        const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ status: "succcess", message: "password has been reset please login", token })
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error })
    }

}