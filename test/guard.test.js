const guard = require('../helpers/guard');
const { HttpCode } = require('../helpers/constants');
const passport = require('passport');


describe('Unit test guard', () => {
    const user = { token: '111222333444555' };
    const req = { get: jest.fn((header) => `Bearer ${user.token}`), user };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => data)
    };

    const next = jest.fn();

    test('User exist', async () => {
        passport.authenticate = jest.fn(
            (strategy, options, cb) => (req, res, next) => {
                cb(null, user)
            },
        )
        guard(req, res, next);
        expect(req.get).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    test('User is not exist', async () => {
        passport.authenticate = jest.fn(
            (strategy, options, cb) => (req, res, next) => {
                cb(null, false)
            },
        );
        guard(req, res, next);
        expect(req.get).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveReturnedWith({
            status: 'error',
            code: HttpCode.UNAUTHORIZED,
            message: 'Not authorized'
        });
    });

    test('User wrong token', async () => {
        passport.authenticate = jest.fn(
            (strategy, options, cb) => (req, res, next) => {
                cb(null, { token: '123456789' })
            }
        );
        guard(req, res, next);
        expect(req.get).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveReturnedWith({
            status: 'error',
            code: HttpCode.UNAUTHORIZED,
            message: 'Not authorized'
        });

    });
});