const mongoose = require('mongoose');
const validator=require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash'); 
const bcrypt=require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fname: String,
  lname: String,
  email: {
    type:String,
    required:true,
    trim:true,
    minlength:1, 
    unique:true, 
    validate:{   
      validator:validator.isEmail,
      message:'{VALUE} is not a valid email'
    } 
      
  } ,
  password:{
    type:String,
    require:true,
    minlength:6
  },
  tokens:[{
    access:{type:String,required:true},
    token:{type:String,required:true}
  }],
  image:String,  
  isAdmin: Boolean

}); 

userSchema.methods.toJSON=function(){
  const user = this;
  var userObject= user.toObject();

  return _.pick(userObject,["_id","email","fname","image"]);
}


userSchema.methods.generateAuthToken = function () {
  const user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};
userSchema.methods.removeToken = function (token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

userSchema.statics.findByToken=function(token){
  var User=this; 
  var decoded;
  try{

    decoded = jwt.verify(token,'abc123');
  }catch(e){
    return new Promise((resolve,reject)=>{
      reject();
    })                                                                                                                            

  }

  return User.findOne(
    {
      _id:decoded._id,
      'tokens.token':token,
      'tokens.access':'auth' 
    }
  )
};


userSchema.statics.findByEmail = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    console.log("hello ");
    if (!user) {
      console.log("hello user");
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      console.log("hello user innn");
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          console.log("hello user innnn password");
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};




userSchema.statics.findByAdmin = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      console.log("not");
      return Promise.reject();
    }
    else{
    if(user.isAdmin==true){
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    })}
  else{
    return Promise.reject();
  }
  };
  });
};
userSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
      var password=user.password;
      bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
          user.password=hash;
          next();
        }); 
      });

    }else{
      next();
    }
});
const User = mongoose.model('User', userSchema);
 
module.exports = User;