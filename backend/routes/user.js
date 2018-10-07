const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  console.log(req.body);
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: "User created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

router.get('', checkAuth, (req, res, next) => {
  User.find()
  .then(documents => {
    res.status(200).json({
      users: documents
    });
  });
});

router.delete('/:id', checkAuth, (req,res,next) => {
  User.deleteOne({_id: req.params.id})
  .then(result =>{
    console.log(result);;
    res.status(200).json({
      message: "Post deleted!"
    });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne( {email: req.body.email})
  .then(user => {
    if (!user) {
     return res.status(401).json({
        message: "Auth failed!"
      });
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password)
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed!"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'secret_code_should_be_long',
        { expiresIn: "1h"}
        );
      res.status(200).json({
        token: token,
        email: fetchedUser.email,
        userId: fetchedUser._id,
        expiresIn: 3600
      });
    });
  }).catch(err => {
    console.log(err);
   return res.status(401).json({
      message: "Auth failed!"
    });
  })
});

module.exports = router;
