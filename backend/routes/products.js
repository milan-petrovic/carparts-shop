const express = require('express');
const router = express.Router();

//import model
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');

router.post('', checkAuth, (req, res, next) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity
  });
  product.save().then(() => {
    console.log(product);
    res.status(201).json({
      message: "Product added successfuly",
    });
  });
});


router.get('', checkAuth, (req,res,next) => {
  const pQuery = Product.find();
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let fetchedProducts;
  if (pageSize && currentPage) {
    pQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }
  pQuery.then(documents => {
    fetchedProducts = documents;
    return Product.count();
  })
  .then(count => {
    res.status(200).json({
      products: fetchedProducts,
      maxProducts: count
    })
  });
});

router.get('/:id', checkAuth, (req, res, next) => {
  Product.findById(req.params.id)
  .then(product => {
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(401).json({
        message: "Product not found!"
      });
    }
  });
});

router.delete('/:id', checkAuth, (req,res,next) => {
  Product.deleteOne({_id: req.params.id})
  .then(result =>{
    console.log(result);;
    res.status(200).json({
      message: "Post deleted!"
    });
  });
});

router.put('/:id' , checkAuth, (req, res, next) => {
  const product = new Product({
    _id: req.body.id,
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
  });
  Product.updateOne({_id: req.params.id}, product)
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "Updated successfuly"
    });
  });
});
module.exports = router;
