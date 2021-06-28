const Mailgen = require('mailgen');
require('dotenv').config();

class EmailService {
    constructor(env, sender) {
        this.sender = sender;
        switch (env) {
            case 'development':
                this.link = 'http://fe90a2aa5d27.ngrok.io';
                break;
            case 'production':
                this.link = 'link for production';
                break;
            default:
                this.link = 'http://fe90a2aa5d27.ngrok.io';
                break;
        };
    };
    #createTemplateVerificationEmail(verifyToken) {
        const mailGenerator = new Mailgen({
            theme: 'salted',
            product: {
                name: 'Borodai Mikhail',
                link: this.link
            }
        });
        const email = {
            body: {
                name: 'Guest',
                intro:
                    "Welcome to our System! We're very excited to have you on board.",
                action: {
                    instructions: 'To get started with our System, please click here:',
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: 'Confirm your account',
                        link: `${this.link}/api/users/verify/${verifyToken}`,
                    },
                },
            },
        }
        return mailGenerator.generate(email);
    };
    async sendVerifyEmail(verifyToken, email) {
        const emailHtml = this.#createTemplateVerificationEmail(verifyToken)
        const msg = {
            to: email,
            subject: 'Verify your account',
            html: emailHtml,
        };
        console.log('Presend')
        const result = await this.sender.send(msg);
        console.log(result);
    };
};

module.exports = EmailService;