const { User, AccountRecovery } = require('./../models');
const { createUserSchema, loginUserSchema } = require('../validators');
const asyncHandler = require('express-async-handler');
const services = require('../services');
const { AppError } = require('../utilities');
const { signRefreshToken } = require('../services/auth');
const jwt = require('jsonwebtoken');
const random = require('lodash/random');
const moment = require('moment');
const sendAccountRecoveryToken = require('../services/Mail/sendAccountRecoveryToken');
const queryString = require('querystring');
const axios = require('axios');

// Signup Controller
const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const validateUserInput = createUserSchema.validate({
    name,
    email,
    password,
  });

  if (validateUserInput.error) {
    let message = '';
    if (validateUserInput.error.details[0].path[0] === 'name')
      message =
        'Name has to start with a letter, can contain spaces, must be at least 3 characters, and no more than 30 characters. No special characters allowed';
    if (validateUserInput.error.details[0].path[0] === 'email')
      message =
        'Email has to start with a letter, can contain numbers and underscores, must be at least 3 characters, must have @com or @net. No spaces and no other special characters allowed';
    if (validateUserInput.error.details[0].path[0] === 'password')
      message =
        'Password has to start with a letter, can contain numbers, must be at least 9 characters, and no more than 30 characters. No spaces and special characters allowed';
    return services.createSendToken({}, 'error', message, res);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    const message = 'User exists';
    return services.createSendToken({}, 'error', message, res);
  }

  const userData = {
    name,
    email,
    password,
  };

  const user = await new User(userData).save();
  const message = 'Account created successfully';
  return services.createSendToken(user, 'success', message, res);
});

const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const validateUserInput = loginUserSchema.validate({
    email,
    password,
  });

  let message = '';
  if (validateUserInput.error) {
    if (validateUserInput.error.details[0].path[0] === 'email')
      message =
        'Email has to start with a letter, can contain numbers and underscores, must be at least 3 characters, must have @com or @net. No spaces and no other special characters allowed';
    if (validateUserInput.error.details[0].path[0] === 'password')
      message =
        'Password has to start with a letter, can contain numbers, must be at least 9 characters, and no more than 30 characters. No spaces and special characters allowed';
    return services.createSendToken({}, 'error', message, res);
  }

  const user = await User.findOne({ email: email });

  //1) if email and password exist
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();
  // // Creates Secure Cookie with refresh token
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  message = 'Logged in successfully';
  return services.createSendToken(user, 'success', message, res);
});

const handleRefreshToken = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies.jwt) next(new AppError('No refresh token found', 401));

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  // console.log(foundUser);
  if (!foundUser) next(new AppError('No user found', 403));
  // evaluate jwt
  //    console.log(process.env.REFRESH_TOKEN_SECRET);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    // console.log(decoded);
    // console.log(foundUser);
    if (err || foundUser.email !== decoded.email)
      next(new AppError('user does not match', 403));
    const payload = {
      id: foundUser._id,
      email: foundUser.email,
    };
    const accessToken = jwt.sign({ ...payload }, process.env.JWT_SECRET, {
      expiresIn: '5h',
    });
    res.json({ accessToken });
  });
});

const generateRecoverAccountToken = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    next(new AppError('account not found', 403));
  }

  const code = random(10000, 99999);
  const accountRecoveryTokenData = {
    userId: user._id,
    email: user.email,
    token: code.toString(),
    expiresAt: moment().add(30, 'minutes'),
  };

  const accountRecoveryToken = await new AccountRecovery(
    accountRecoveryTokenData
  ).save();
  await sendAccountRecoveryToken(accountRecoveryToken.token, email);
  // await MailService.sendAccountRecoveryToken({
  //   token: accountRecoveryToken.token,
  //   email,
  // });

  return res.send({
    status: 'success',
    message: 'account recovery token has been sent to your email',
    data: {
      account_recovery_token: accountRecoveryToken.token,
    },
  });
});

const recoverAccount = asyncHandler(async (req, res, next) => {
  let { token, password, email } = req.body;

  const recoveryToken = await AccountRecovery.findOne({
    email: email,
    token: token,
  });
  if (!recoveryToken) {
    next(new AppError('token is invalid', 400));
  }
  if (moment().isAfter(recoveryToken.expires_at)) {
    next(new AppError('token has expired', 400));
  }
  const user = await User.findById(recoveryToken.userId);
  user.password = password;
  await user.save();

  // remove recovery token
  await AccountRecovery.findByIdAndDelete(recoveryToken._id);

  return res.send({
    status: 'success',
    message: 'account recovered',
  });
});

//  Get Google login URL
const getGAuthURL = asyncHandler(async (req, res, next) => {
  const rootURL = 'https://accounts.google.com/o/oauth2/auth';
  const options = {
    redirect_uri: `${process.env.UI_ROOT_URI}`,
    client_id: `${process.env.GOOGLE_CLIENT_ID}`,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar',
    ].join(' '),
  };
  return res.send({
    status: 'success',
    message: 'User should visit this url to be authenticated',
    data: {
      signInURL: `${rootURL}?${queryString.stringify(options)}`,
    },
  });

  // return res.redirect(getGoogleAuthURL())
});
//  Get User from Google
const googleUserX = asyncHandler(async (req, res, next) => {
  const url = 'https://oauth2.googleapis.com/token';
  const code = req.body.code;
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.SERVER_ROOT_URI,
    grant_type: 'authorization_code',
  };
  axios
    .post(url, queryString.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(async (resD) => {
      const { id_token, access_token, refresh_token } = resD.data;
      // Fetch the user's profile with the access token and bearer
      await axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
          {
            headers: {
              Authorization: `Bearer ${id_token}`,
            },
          }
        )
        .then(async (resK) => {
          const name = resK.data.name,
            email = resK.data.email,
            verifiedEmail = resK.data.verified_email,
            refreshToken = refresh_token,
            userData = {
              name,
              email,
              verifiedEmail,
              refreshToken,
            };
          try {
            let rt = await new User(userData).save();
            let message = 'success';
            res.cookie('jwt', refreshToken, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
            });
            return services.googleSendToken(
              access_token,
              'success',
              message,
              res
            );
          } catch (error) {
            const userExists = await User.findOne({ email });
            let message = 'registered';
            res.cookie('jwt', refreshToken, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
            });
            return services.googleSendToken(
              access_token,
              'registered',
              message,
              res
            );
          }
        })
        .catch((error) => {
          next(error.message);
        });
    })
    .catch((error) => {
      next(error.message);
    });
});

module.exports = {
  signup,
  signin,
  handleRefreshToken,
  generateRecoverAccountToken,
  recoverAccount,
  getGAuthURL,
  googleUserX,
};
