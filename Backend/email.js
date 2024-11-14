//email.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
   
});

const sendContactEmail = async (toEmail, subject, text) => {
  const mailOptions = {
    from: " ",
    to: toEmail,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendContactEmail };