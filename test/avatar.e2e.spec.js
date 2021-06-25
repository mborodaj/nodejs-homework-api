const supertest = require('supertest');
const jwt = require('jsonwebtoken');
jest.mock('fs/promises');
const fs = require('fs/promises');
const { unlink, access, rename } = jest.requireActual('fs/promises');
const path = require('path');
const Users = require('../repositories/users');
const Services = require('../services/local-upload');


require('dotenv').config();

const app = require('../app');
const db = require('../model/db');
const User = require('../model/user');

const { testUser } = require('./data/data');

describe('Test route user avatars', () => {
    let user, token, re, file;

    beforeAll(async () => {
        await db;
        await User.deleteOne({ email: testUser.email });
        user = await User.create(testUser);
        const SECRET_KEY = process.env.SECRET_KEY
        const issueToken = (payload, secret) => jwt.sign(payload, secret)
        token = issueToken({ id: user._id }, SECRET_KEY)
        await Users.updateToken(user._id, token)
        re = new RegExp(`^${user._id}\.+avatar.jpg$`);
    });

    afterAll(async () => {
        unlink(path.join('tmp', file));
        const mongo = await db;
        await User.deleteOne({ email: testUser.email });
        await mongo.disconnect();
    });

    test('Upload user avatar success', async () => {
        fs.access.mockReturnValue(Promise.resolve(false));
        const response = await supertest(app)
            .patch('/api/users/avatars')
            .set('Authorization', `Bearer ${token}`)
            .attach('avatar', './test/data/avatar.jpg')
        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.status).toEqual('success');
        expect(response.body.code).toEqual(200);
        expect(response.body.data.avatarURL).toBeDefined();
        expect(re.test(response.body.data.avatarURL)).toBeTruthy();
        file = response.body.data.avatarURL.toString().split('\\');
        file = file[file.length - 1];
    });

    test('Upload user avatar fail token', async () => {
        const fakeToken = 'fggghhhggggghhjkk';
        fs.unlink.mockReturnValue(Promise.resolve(path.join('tmp', file)));
        const buf = await fs.readFile.mockReturnValue(Promise.resolve(('./test/data/avatar.jpg')));
        const response = await supertest(app)
            .patch('/api/users/avatars')
            .set('Authorization', `Bearer ${fakeToken}`)
            .attach('avatar', buf, 'avatar.jpg')
        expect(response.status).toEqual(401)
    });
});