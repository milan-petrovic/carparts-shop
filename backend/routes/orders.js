const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Order = require('../models/order');
const checkAuth = require('../middleware/check-auth');

router.post('', checkAuth, (req, res, next) => {
  const order = new Order({
    product: req.body.product,
    creator: req.userData.email
  });
  order.save()
  .then(() => {
    res.status(200).json({
      message: "Order added succesfully"
    });
  })
});

router.get('', checkAuth, (req, res, next) => {
  Order.find()
  .then(documents => {
    res.status(200).json({
      orders: documents,
    });
  });
});

router.delete('/:id', checkAuth, (req,res,next) => {
  Order.deleteOne({_id: req.params.id})
  .then(result =>{
    console.log(result);;
    res.status(200).json({
      message: "Post deleted!"
    });
  });
});

router.post('/send', checkAuth, (req, res, next) => {
  const orderMailer = {
    orderId: req.body.orderId,
    email: req.body.email
  };



  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'valprom.wotis@gmail.com',
      pass: 'Sprinter11'
    }
  });

  let mailOptions = {
    from: '"VALPROM doo" <valprom.wotis@gmail.com>', // sender address
    to: orderMailer.email, // list of receivers
    subject: '[VALPROM: Promjena statusa porudzbine', // Subject line
    text: 'Vasa porudzbina ID: ' + orderMailer.orderId + ' je uspjesno prihvacena.', // plain text body

  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('thankYou', { msg: req.body.name });
    res.status(200).json({
      message: "Email sent succesfully"
    });
  });

});



module.exports = router;
