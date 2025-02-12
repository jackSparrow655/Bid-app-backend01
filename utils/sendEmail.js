import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  // console.log("email = ", email)
  // console.log("subject = ", subject)
  // console.log("message = ", message)
  const transporter =  nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  const options = {
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    text: message,
  };
  try{
    await transporter.sendMail(options);
  } catch(err){
    console.log("some error in sending mail", err)
  }
  console.log("mail sent")
};
