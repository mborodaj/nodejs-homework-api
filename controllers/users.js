const Users = require('../repositories/users');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const path = require('path');
const EmailService = require('../services/email');
const CreateSenderNodemailer = require('../services/email-sender');

require('dotenv').config();
const UploadAvatarService = require('../services/local-upload');

const { HttpCode } = require('../helpers/constants');
const SECRET_KEY = process.env.SECRET_KEY;

const AVATAR_OF_USERS = path.join('public', process.env.AVATAR_OF_USERS)



const register = async (req, res, next) => {
    try {
        console.log(process.env.NODE_ENV);
        const user = await Users.findByEmail(req.body.email);

        if (user) {
            return res.status(HttpCode.CONFLICT).json({
                status: 'error',
                code: HttpCode.CONFLICT,
                message: 'User with this email is already exist',
            });
        };

        const {
            email,
            subscription,
            avatarURL,
            verifyToken
        } = await Users.create(req.body);

        try {
            const emailService = new EmailService(
                process.env.NODE_ENV,
                new CreateSenderNodemailer(),
            );
            await emailService.sendVerifyEmail(verifyToken, email);
        } catch (error) {
            console.log(error.message);
        };

        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            data: { email, subscription, avatarURL }
        });

    } catch (e) {
        next(e);
    };
};

const login = async (req, res, next) => {
    try {
        const user = await Users.findByEmail(req.body.email);
        const isValidPassword = await user?.isValidPassword(req.body.password);

        if (!user || !isValidPassword || !user.verify) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                message: 'Email or password is wrong',
            });
        };

        const { id, email, subscription, avatarURL } = user;
        const payload = { id };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });

        await Users.updateToken(id, token);
        return res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: { token, user: { email, subscription, avatarURL } }
        });
    } catch (e) {
        next(e);
    };
};

const current = async (req, res, next) => {
    try {
        const user = await Users.findByToken(req.user.token);

        if (!user) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                message: 'Not authorized',
            });
        };

        const { email, subscription, avatarURL } = user;

        return res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: { email, subscription, avatarURL }
        });
    } catch (e) {
        next(e);
    };
};

const updateSubscription = async (req, res, next) => {
    try {
        const user = await Users.findByToken(req.user.token);

        if (!user) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                message: 'Not authorized',
            });
        };

        if (!req.body?.subscription) {
            return res.status(HttpCode.BAD_REQUEST).json({
                status: 'error',
                code: HttpCode.BAD_REQUEST,
                message: 'No valid request body',
            });
        }

        const { id, email } = user;
        let { subscription } = user;
        subscription = req.body.subscription.toLowerCase();

        await Users.updateSubscription(id, subscription);

        return res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: { email, subscription }
        });
    } catch (e) {
        next(e);
    };
};

const logout = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user._id);

        if (!user) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                message: 'Not authorized',
            });
        };

        const id = user.id;
        await Users.updateToken(id, null)
        return res.status(HttpCode.NO_CONTENT).json({});
    } catch (e) {
        next(e)
    };
};

const avatars = async (req, res, next) => {

    try {
        if (!req.user?.token) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                status: 'error',
                code: HttpCode.UNAUTHORIZED,
                message: 'Not authorized',
            });
        };

        const id = req.user.id;
        const uploads = new UploadAvatarService(AVATAR_OF_USERS);
        const avatarURL = await uploads.saveAvatar({ idUser: id, file: req.file });

        try {
            await fs.unlink(path.join(AVATAR_OF_USERS, req.user.avatarURL));
        } catch (e) {
            console.log(e.message);
        };

        await Users.updateAvatar(id, avatarURL);
        res.status(HttpCode.OK).json({
            status: 'success',
            code: HttpCode.OK,
            data: { avatarURL }
        });
    } catch (error) {
        next(error);
    };

};

const verify = async (req, res, next) => {
    try {
        console.log(process.env.NODE_ENV);
        const user = await Users.findByVerifyToken(req.params.verificationToken);
        if (user) {
            await Users.updateTokenVerify(user.id, true, null);
            return res.status(HttpCode.OK)
                .json({
                    status: 'success',
                    code: HttpCode.OK,
                    data: { message: 'Verification successful' },
                });
        };
        return res.status(HttpCode.NOT_FOUND).json({
            status: 'error',
            code: HttpCode.NOT_FOUND,
            message: 'User not found',
        });
    } catch (error) {
        next(error)
    };
};

const repeatEmailVerification = async (req, res, next) => {

    try {
        if (!req.body?.email) {
            return res.status(HttpCode.BAD_REQUEST).json({
                status: 'error',
                code: HttpCode.BAD_REQUEST,
                message: 'No valid request body',
            });
        };
        const user = await Users.findByEmail(req.body.email);

        if (user) {
            const { email, verifyToken, verify } = user;

            if (!verify) {
                const emailService = new EmailService(
                    process.env.NODE_ENV,
                    new CreateSenderNodemailer()
                );
                await emailService.sendVerifyEmail(verifyToken, email);
                console.log(email, verifyToken, verify)
                return res.status(HttpCode.OK)
                    .json({
                        status: 'success',
                        code: HttpCode.OK,
                        data: { message: 'Resubmitted successful' },
                    });
            };
            return res.status(HttpCode.CONFLICT)
                .json({
                    status: 'error',
                    code: HttpCode.CONFLICT,
                    message: 'User with this email has been verified',
                });
        };
        return res.status(HttpCode.NOT_FOUND).json({
            status: 'error',
            code: HttpCode.NOT_FOUND,
            message: 'User not found',
        })
    } catch (error) {
        next(error);
    };
};

module.exports = {
    register,
    login,
    logout,
    current,
    updateSubscription,
    avatars,
    verify,
    repeatEmailVerification
};