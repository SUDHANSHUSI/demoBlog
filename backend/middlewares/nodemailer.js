const nodemailer = require("nodemailer");

const EMAIL_USERNAME = "sudhanshusingh0401@gmail.com";
const EMAIL_PASSWORD = "ejlsrglnchhdusyn";
const EMAIL_HOST = "smtp.gmail.com";
const EMAIL_PORT = 587;

const sendEmail = async (options) => {
  // validation of who is sending and authorization to send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  // 2) defining whom to send and all other options (header, message, etc.)
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) now actually send the email
  await transporter.sendMail(mailOptions, (error, info, next) => {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent:", info.response);
    }
  });
};

module.exports = sendEmail;
