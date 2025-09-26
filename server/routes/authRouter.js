const express = require('express');
const { postLogin, postSignup, postLogout, updatePicture, checkAuth } = require('../controllers/authController');
const { checkUser } = require('../middlewares/checkUser');
const authRouter = express.Router();

authRouter.post('/login' , postLogin)

authRouter.post('/signup', postSignup)

authRouter.post('/logout', postLogout)


authRouter.get("/check", checkUser, checkAuth);

module.exports = authRouter;