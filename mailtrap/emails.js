import { mailtrapClient, sender } from "./mailtrap.config.js";
// import {
//   PASSWORD_RESET_REQUEST_TEMPLATE,
//   VERIFICATION_EMAIL_TEMPLATE,
// } from "./emailTemplates.js";

// export const sendVerificationEmail = async (email, verificationToken) => {
//   const recipent = [{ email }];
//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: recipent,
//       subject: "Verify your email",
//       html: VERIFICATION_EMAIL_TEMPLATE.replace(
//         "{verificationCode}",
//         verificationToken
//       ),
//       category: "Email Verification",
//     });
//     console.log("Email sent successfully:", response);
//   } catch (error) {
//     console.error(`Error sending verification:`, error);

//     throw new Error(`Error sending verification email: ${error}`);
//   }
// };

// export const sendWelcomeEmail = async (email, name) => {
//   const recipient = [{ email }];

//   try {
//     await mailtrapClient.send({
//       from: sender,
//       to: recipient,
//       // from mail trap email template
//       template_uuid: "fe50ed5c-f917-4a66-a5a9-deaf3e8ff52f",
//       template_variables: {
//         company_info_name: "AutoCartel",
//         name: "Cartel",
//       },
//     });
//     console.log("Welcome Email sent successfully");
//   } catch (error) {
//     console.error(`Error sending welcome email:`, error);

//     throw new Error(`Error sending welcome email: ${error}`);
//   }
// };

// export const sendPasswordResetEmail = async (email, resetURL) => {
//   const recipent = [{ email }];

//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: recipent,
//       subject: "Reset your password",
//       html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
//     });
//   } catch (error) {
//     console.error(`Error sending password reset email:`, error);

//     throw new Error(`Error sending password reset email: ${error}`);
//   }
// };

// export const sendResetSuccessEmail = async (email) => {
//   const recipient = [{ email }];

//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: recipient,
//       subject: "Password Reset Successful",
//       html: PASSWORD_RESET_SUCCESS_TEMPLATE,
//       category: "Password Reset ",
//     });
//     console.log("Password Reset Email sent successfully:", response);
//   } catch (error) {
//     console.error(`Error sending password reset success email:`, error);

//     throw new Error(`Error sending password reset success email: ${error}`);
//   }
// };

//using node mailer
import nodemailer from "nodemailer";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Disables the self-signed certificate validation
  },
});

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipent = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipent,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error(`Error sending verification:`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Welcome",
      html: WELCOME_EMAIL_TEMPLATE,
      category: "Welcome ",
    });

    console.log("Welcome Email sent successfully");
  } catch (error) {
    console.error(`Error sending welcome email:`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipent = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipent,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
  } catch (error) {
    console.error(`Error sending password reset email:`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset ",
    });
    console.log("Password Reset Email sent successfully:", response);
  } catch (error) {
    console.error(`Error sending password reset success email:`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
