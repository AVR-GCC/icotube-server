const sgMail = require('@sendgrid/mail')

const ourEmail = 'support@icotube.co';

const generateEmailConfirmationHTML = (token) => {
    const baseUrl = process.env.NODE_ENV === 'dev' ? 'http://localhost:5000' : 'https://server.icotube.co';
    const link = `${baseUrl}/auth/confirm?token=${token}`;
    return (`
        <html>
            <head>
                <title>ICOTube confirm email</title>
                <style>
                body {
                    background-color: #000000;
                    font-family: Roboto, Helvetica, Arial, sans-serif;
                    color: #fff;
                }
                a {
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
                a:hover {
                    background-color: rgba(25, 118, 210, 0.04);
                    color: rgb(25, 118, 210);
                    text-decoration: none;
                    border: 1px solid rgb(25, 118, 210);
                }
                </style>
            </head>
            <body>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr style="background: #000000;">
                        <td align="center" bgcolor="#000000">
                            <table width="600" border="0" cellspacing="0" cellpadding="0">
                                <tr bgcol>
                                    <td style="padding: 40px 0 30px 0;" align="center">
                                        <img src="http://cdn.mcauto-images-production.sendgrid.net/3d7650ec8baeb7ee/74165dfe-ecf4-4668-b964-651413167b09/411x173.png" alt="Your Logo" width="200">
                                        <h1 style="font-size: 28px;">Welcome to ICOTube!</h1>
                                        <p style="font-size: 16px; line-height: 1.5;">Please click the button below to verify your email address:</p>
                                        <p style="font-size: 16px; line-height: 1.5;"><a href="${link}" style="display: inline-block; font-size: 16px; line-height: 1.5; padding: 10px 20px; text-decoration: none;">Verify Email</a></p>
                                        <p style="font-size: 16px; line-height: 1.5;">If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                                        <p style="font-size: 16px; line-height: 1.5;">${link}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `);
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmationEmail = (token, email) => {
    const html = generateEmailConfirmationHTML(token);
    const msg = {
        to: email,
        from: ourEmail,
        subject: 'Email confirmation',
        text: 'and easy to do anywhere, even with Node.js',
        html,
    };
    sgMail.send(msg)
        .then(() => {
            console.log('Email sent')
        }).catch((error) => {
            console.error(error)
        });
}

module.exports = {
    sendConfirmationEmail
};