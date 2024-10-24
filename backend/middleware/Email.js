// Email.js
const { Verification_Email_Template, Welcome_Email_Template } = require("../templates/EmailVerification");
const { transporter } = require("./Email.config");

exports.sendVerificationCode = async (options) => {
  try {
    const response = await transporter.sendMail({
      from: `"ChatWave" <${process.env.SMTP_MAIL}>`, // Correct 'from' format
      to: options.mail, // Receiver's email
      subject: options.subject, // Subject line
      text: `Your verification code is ${options.verificationCode}`, // Plain text body
      html: Verification_Email_Template.replace("{verificationCode}", options.verificationCode).replace("{name}", options.name) // HTML body
    });

    //console.log("Verification email sent successfully:", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email.");
  }
};

exports.sendWelcomeMail = async (options) => {
  try {
    const response = await transporter.sendMail({
      from: `"ChatWave" <${process.env.SMTP_MAIL}>`, // Correct 'from' format
      to: options.mail, // Receiver's email
      subject: options.subject, // Subject line
      text: `Welcome to ChatWave, ${options.name}!`, // Plain text body
      html: Welcome_Email_Template.replace("{name}", options.name).replace("{resetUrl}", process.env.FRONTEND_URL), // HTML body
    });

    //console.log("Welcome email sent successfully:", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Could not send welcome email.");
  }
};
// Send Password Reset Email
exports.sendPasswordResetEmail = async ({ mail, subject, name, resetUrl }) => {
  const mailOptions = {
    from: `"ChatWave" <${process.env.SMTP_MAIL}>`,
    to: mail,
    subject: subject,
    html: `
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Please click on the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};