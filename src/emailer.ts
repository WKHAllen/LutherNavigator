/**
 * Send emails.
 * @packageDocumentation
 */

import * as nodemailer from "nodemailer";

/**
 * Email address environment variable.
 */
export const emailAddress = process.env.EMAIL_ADDRESS;

/**
 * Email app password environment variable.
 */
const emailPassword = process.env.EMAIL_APP_PASSWORD;

/**
 * When sending an email fails, the amount of time to wait before retrying.
 */
const emailTimeout = 60 * 1000;

/**
 * Send an email.
 *
 * @param emailTo The destination address.
 * @param subject The email subject line.
 * @param html The email body HTML.
 * @param text The email body text.
 * @param tryNum The number of times the email has tried to send.
 */
export async function sendEmail(
  emailTo: string,
  subject: string,
  html: string,
  text: string = "",
  tryNum: number = 1
): Promise<void> {
  return new Promise((resolve) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: emailAddress,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: {
        name: "Luther Navigator",
        address: emailAddress,
      },
      to: emailTo,
      subject: subject,
      html: html,
      text: text,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.warn(
          `Error sending email to '${emailTo}' (try ${tryNum}):\n`,
          err
        );
        setTimeout(() => {
          sendEmail(emailTo, subject, html, text, tryNum + 1).then(resolve);
        }, emailTimeout);
      } else {
        resolve();
      }
    });
  });
}
