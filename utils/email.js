const sgMail = require('@sendgrid/mail')

const ourEmail = 'support@icotube.co';

const backUrl = process.env.NODE_ENV === 'dev' ? 'http://localhost:5000' : 'https://server.icotube.co';
const frontUrl = process.env.NODE_ENV === 'dev' ? 'http://localhost:3000' : 'https://www.icotube.co';

const logoHTML = '<img src="http://cdn.mcauto-images-production.sendgrid.net/3d7650ec8baeb7ee/74165dfe-ecf4-4668-b964-651413167b09/411x173.png" alt="ICOTube Logo" width="200">';

const emailCSS = `
    <style>
        body {
            font-family: Roboto, Helvetica, Arial, sans-serif;
            color: #fff;
        }
        h1, h2, p {
            margin-top: 0;
            margin-bottom: 20px;
            cursor: default !important;
        }
        h1 {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
        }
        h2 {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        p {
            font-size: 16px;
            text-align: justify;
            line-height: 1.5;
            margin-bottom: 30px;
        }
        .container {
            font-family: Roboto, Helvetica, Arial, sans-serif;
            color: #fff;
        }
        .button {
            color: rgb(25, 118, 210);
            text-decoration: none;
            border: 1px solid rgba(25, 118, 210, 0.5);
            font-weight: 500;
            font-size: 0.875rem;
            border-radius: 4px;
            padding: 10px 20px;
            display: inline-block;
            font-size: 16px;
            line-height: 1.5;
        }
        .button:hover {
            background-color: rgba(25, 118, 210, 0.04);
            color: rgb(25, 118, 210);
            text-decoration: none;
            border: 1px solid rgb(25, 118, 210);
        }
    </style>
`;

const makeResetPasswordBody = (password) => `
    <h1 style="cursor: default;">Password Reset</h1>
    <p style="cursor: default;">Hello</p>
    <p style="cursor: default;">Your password has been reset. Your new password is:</p>
    <h2 class="button">${password}</h2>
    <p style="cursor: default;">Please log in to your account using your new password. We recommend changing your password as soon as possible to ensure the security of your account.</p>
    <a href="${frontUrl}?login=1" class="button">Log In</a>
    <p style="cursor: default;">Thank you for using our service!</p>
`;

// <p>If you did not request a password reset, please contact us immediately at [SUPPORT EMAIL].</p>

const makeEmailConfirmationBody = (link) => `
    <h1 style="cursor: default;">Welcome to ICOTube!</h1>
    <p style="cursor: default;">Please click the button below to verify your email address:</p>
    <p><a href="${link}" class="button" style="display: inline-block; font-size: 16px; line-height: 1.5; padding: 10px 20px; text-decoration: none;">Verify Email</a></p>
    <p style="cursor: default;">If the button above doesn't work, you can copy and paste the following link into your browser:</p>
    <p>${link}</p>
`;

const makeEmailHTML = (title, body) => `
    <html>
        <head>
            <title>${title}</title>
            ${emailCSS}
        </head>
        <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" bgcolor="#000000" style="border-radius: 40px;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0">
                            <tr bgcol>
                                <td class="container" style="padding: 40px 0 30px 0;" align="center">
                                    ${logoHTML}
                                    ${body}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
`;

const generateResetPasswordHTML = (password) => {
    return (makeEmailHTML('ICOTube Reset Password', makeResetPasswordBody(password)));
};

const generateEmailConfirmationHTML = (token) => {
    const link = `${backUrl}/auth/confirm?token=${token}`;
    return (makeEmailHTML('ICOTube Confirm Email', makeEmailConfirmationBody(link)));
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetPasswordEmail = (password, email) => {
    const html = generateResetPasswordHTML(password);
    const msg = {
        to: email,
        from: ourEmail,
        subject: 'Password Reset',
        html,
    };
    sgMail.send(msg)
        .then(() => {
            console.log(`Reset password email sent to ${email}`);
        }).catch((error) => {
            console.error(error);
        });
};

const sendConfirmationEmail = (token, email) => {
    const html = generateEmailConfirmationHTML(token);
    const msg = {
        to: email,
        from: ourEmail,
        subject: 'Email confirmation',
        html,
    };
    sgMail.send(msg)
        .then(() => {
            console.log(`Confirmation email sent to ${email}`);
        }).catch((error) => {
            console.error(error);
        });
};

module.exports = {
    sendConfirmationEmail,
    sendResetPasswordEmail
};