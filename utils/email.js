const nodemailer = require('nodemailer');

const sendMail =  async options=>{
    // creating mail transporter
    const transpoter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    // defining mailOptions
    const mailOptions = {
        from:'kiran.io<do-not-reply@kiran.io>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    // sending email
    await transpoter.sendMail(mailOptions);
}

module.exports = sendMail;