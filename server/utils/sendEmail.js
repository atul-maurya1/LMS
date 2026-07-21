 import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, message) => {
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.EMAIL_PASSWORD
      }
   });

   await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html: message
   });
};
