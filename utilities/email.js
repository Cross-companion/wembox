const pug = require('pug');
// const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor({ user, url, otp }) {
    this.to = user.email;
    this.firstName = user?.name.split(' ')[0] || 'Dear user';
    this.url = url;
    this.otp = otp;
    this.from = `Nwodoh Daniel <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // USE SENDGRID IF IN "PRODUCTION"
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // SEND actual email
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        otp: this.otp,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: this.message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Wembox! [A.K.A Wembee]');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Wembox password reset token.  (expires in 10 minutes)'
    );
  }

  async sendEmailVerificationOTP() {
    await this.send(
      // 'otpEmail',
      'emailVerificationOTP',
      `Wembox Verification Code [${this.otp}] (expires in 10 minutes)`
    );
  }
};
