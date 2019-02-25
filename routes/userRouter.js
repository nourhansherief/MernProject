const express = require('express');
const router = express.Router();
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
var {authenticate}=require('../middleWare/authenticate');
 



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
  });
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
  });
const parser = multer({ storage: storage });

router.post('/image', parser.single("image"), (req, res) => {
  console.log(req.file) ;
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;
  User.image.create(image) 
    .then(newImage => res.json(newImage))
    .catch(err => console.log(err));
});



router.get('/', (req, res) => {
//   User.find({}, (err, books) => {
//     if (!err) res.send(books);
//     else{
//         res.send("an error occured");
//     }
// });
});


//Login
router.post('/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);  
  User.findByEmail(body.email,body.password).then((user)=>{
   return user.generateAuthToken().then((token)=>{
    res.header('x-auth', token).send(user);
   });
  }).catch((e)=>{
    res.status(400).send(e);
  }); 
});
 
//signUP 
router.post('/create', (req, res) => {
    var body = _.pick(req.body,['fname','lname','email','password']);
    var user = new User(body);
  
    user.save().then(() => { 
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    })

  });

// router.get('/me', authenticate, (req, res) => {
//     res.send(req.user);
//   });
 
  


// router.post('/:isAdmin', (req, res) => {
//     const tfname = req.body.fname;
//     const tlname = req.body.lname;
//     const temail = req.body.email;
//     const tpassword = req.body.password;
//     const timage = req.body.image;
//     const tisAdmin = req.params.isAdmin;
//     const user = new User({
//         fname: tfname,
//         lname: tlname,
//         email: temail,
//         password: tpassword,
//         image: timage,
//         isAdmin: tisAdmin
//     });
//     user.save((err) => {
//         if(!err) res.send("User was saved successfully");
//         else res.send("Error while saving");
//     });
// });

// router.put('/:id',(req, res) => {
//     const tfname = req.body.fname;
//     const tlname = req.body.lname;
//     const temail = req.body.email;
//     const tpassword = req.body.password;
//     const timage = req.body.image;
//     const id = req.params.id;
//     User.updateOne({_id:id}, { $set: {fname: tfname, lname: tlname, email: temail, password: tpassword, image: timage} }, (err) => {
//         if(!err) res.send("Updated Successfully");
//         else res.send("Failed to update");
//     })
// })

// router.delete('/:id', (req, res) => {
//     const id = req.params.id;
//     User.deleteOne({ _id: id }, (err) => {
//         if (!err) res.send('Deleted Successfully');
//         else{
//             res.send("Error Occured");
//         }
//     })
// })

module.exports = router;