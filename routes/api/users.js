const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/users');
const guard = require('../../helpers/guard');
const { validateUser,
    validateUpdateUserSubscription
} = require('../../validation/userValidation');
const upload = require('../../helpers/upload');

router.post('/register', validateUser, ctrl.register);
router.post('/login', validateUser, ctrl.login);
router.post('/logout', guard, ctrl.logout);
router.get('/current', guard, ctrl.current);
router.patch('/', guard, validateUpdateUserSubscription, ctrl.updateSubscription);
router.patch('/avatars', guard, upload.single('avatar'), ctrl.avatars);

module.exports = router;
