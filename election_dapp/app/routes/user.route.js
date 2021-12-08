const User = require('../models/user.model.js');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const validateLoginIput=require('../validation/login.validation.js');
const validateRegisterInput=require('../validation/register.validation.js');
const {validateUpdateUserInput, validateResetPassword}=require('../validation/updateUser.validation.js');
const keys = require('../config/dbconfig.js');
const {saveImage} = require('../utils/imageManager.js');
const {createPerson, verifyPerson} = require('../utils/luxandApi');
const nodemailer = require('nodemailer');
const fs = require('fs');
var router=require("express").Router();

const tempFilePath = process.env.TEMP_FILES;
//login user
router.post("/login",(req, res)=>{
    const {errors, isValid}=validateLoginIput(req.body);
    if(!isValid){
        return res.status(400).send(errors);
    }

    const username=req.body.username;
    const password=req.body.password;
    User.findOne({username})
        .then(user=>{
            if(!user){
                return res.status(404).send("User name not found!");
            }
            
            // verifyPerson({ luxandId: user.luxandId, base64data: req.body.base64Image })
            // .then(verifiedStatus => {
            // console.log('Verified Status >', verifiedStatus);
                setTimeout(function(){
                    bcrypt.compare(password, user.password)
                    .then(isMatch=>{
                        if(isMatch){
                            const payload={
                                id:user.id,
                                username:user.username,
                                email:user.email
                            };
                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                {
                                    expiresIn:31556926
                                },
                                (err,token)=>{
                                    res.json({
                                        success:true,
                                        token:"Bearer"+token
                                    });
                                }
                            );

                        }
                        else{
                            res.status(400).send("Password is incorrect!");
                        }
                    });
                },3000);
                
            // })
            // .catch(error => {
            //     res.status(400).send('Face detection error');
            // })
            
        });
});

//user add request
router.post("/user-add", (req,res)=>{
  
    const {errors, isValid}=validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).send(errors);
    }

    console.log()
    console.log("Register body:", req.body);
    
    const {base64Image}=req.body;
    console.log("base64Image", base64Image);

    User.findOne({username:req.body.username})
        .then(user=>{
            if(user)
            {
               console.log("exist");
               return res.status(400).send("User name already exists!");
            } else {
                console.log("exist no");

                const newUser=new User({
                    name:req.body.name,
                    username:req.body.username,
                    email:req.body.email,
                    phone:req.body.phone,
                    address:req.body.address,
                    password:req.body.password,
                    verified:req.body.verified,
                    walletaccount:req.body.walletaccount
                });
               
                createPerson({name: newUser.username, base64data:  base64Image})
                    .then(personId=>{
                        console.log(personId, 'this is personId =======================')
                        newUser.luxandId = personId;
                        setTimeout(function() {
                            bcrypt.genSalt(10,(err,salt)=>{
                                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                                    if(err)throw err;
                                    newUser.password=hash;
            
                                    newUser.save()
                                            .then(user=>{
                                                return res.status(200).send(user);
                                            })
                                            .catch(err=>{
                                                return res.status(500).send("Some error occurred while registering...");
                                            });
                                });
                            });
                       }, 3000);
                    })
                
                
            }

        });
});


//getting all user data 
router.post("/user-data",(req, res)=>{
    User.find({}).select(['-password'])
        .then(users=>{
            if(users){
                return res.status(200).send(users);
            }
        });
});

//delete user
router.post('/user-delete',(req, res)=>{
    User.deleteOne({id:req.body.id})
        .then(user=>{
            if(user){
                return res.status(200).send(
                   "User deleted successfully. Refreshing data..."
                );
            }
        });
});

//update user
router.post('/user-update',(req, res)=>{
    const {errors, isValid}=validateUpdateUserInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    const id=req.body.id;
    User.findOne({id})
        .then(user=>{
            if(user){
                if(req.body.password!=""){
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(req.body.password,salt,(err,hash)=>{
                            if(err)throw err;
                            user.password=hash;
                        });
                    });
                }
                let update={
                    'firstname':req.body.firstname,
                    'lastname':req.body.lastname,
                    'email':req.body.email,
                    'password':user.password
                };
                User.update({id:id},{$set:update}, (err, result)=>{
                    if(err){
                        return res.status(400).send("Unable to update user.");
                    } else {
                        return res.status(200).send("User updated successfully. Refreshing data...");
                    }
                });
            } else{
                return res.status(400).send(
                    "Now user not found!"
                );
            }
        });
});

const randomName = (length=10) => Math.random().toString(20).substr(2, length);

router.post('/user/upload-image',async(req,res)=>{
    try {
        const { candidateList } = req.body;
        for (let i = 0; i < candidateList.length; i++) {
          const fileName = randomName();
          const img = await saveImage(candidateList[i].avatarBase64, fileName);
          if(!img){
              res.status(500).send("Some errors occurred while saving image files.");
              return;
          }
          candidateList[i].avatarUrl = fileName;
          delete candidateList[i].avatarBase64;
        }
        res.status(200).send({candidateList:candidateList});
       
      } catch (error) {
        res.status(500).send("Some errors occurred in server side.")
      }
});
router.post('/user/verify-email',async(req,res)=>{
    try{
        const {name, email} = req.body;
        if(email){
            const verificationCode = Math.floor(100000+Math.random()*900000).toString();

            let mailTransporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.EMAIL_SENDER,
                    pass:process.env.EMAIL_PASS
                }
            });
            let mailDetails = {
                from:process.env.EMAIL_SENDER,
                to:email,
                subject:'Verify Email',
                html:`<h1>Email Confirmation</h1>
                <h2>Hello ${name}</h2>
                <p>Please confirm your email with following verification code: ${verificationCode}</p>
                </div>`
            };

            
            mailTransporter.sendMail(mailDetails, function(err, data){
                if(err){
                    res.status(400).send('Some errors occurred while sending email...');
                } else { 
                    res.status(200).send({email:email, verificationCode:verificationCode});
                }
            });
            console.log(verificationCode,'pass');
        }
    }catch(error){
        res.status(400).send('Some errors occurred while sending email...');
    }
});
router.post('/user/send-email',async(req,res)=>{
    try{
        const {email}=req.body;
        if(email){
            User.findOne({email:email})
                .then(user=>{
                    if(user){
                        console.log(user.name);
                        const verificationCode = Math.floor(100000+Math.random()*900000).toString();

                        let mailTransporter = nodemailer.createTransport({
                            service:'gmail',
                            auth:{
                                user:process.env.EMAIL_SENDER,
                                pass:process.env.EMAIL_PASS
                            }
                        });
                        let mailDetails = {
                            from:process.env.EMAIL_SENDER,
                            to:email,
                            subject:'Verify Email',
                            html:`<h1>Email Confirmation</h1>
                            <h2>Hello ${user.name}</h2>
                            <p>Please confirm your email with following verification code: ${verificationCode}</p>
                            </div>`
                        };

                        
                        mailTransporter.sendMail(mailDetails, function(err, data){
                            if(err){
                                res.status(400).send('Some errors occurred while sending email...');
                            } else {
                                res.status(200).send({email:email, verificationCode:verificationCode});
                         }
                        });
                        console.log(verificationCode,'sent');
                    } else{
                        res.status(400).send('Invalid email');
                    }
                    
                })
        }
    }catch(error){
        res.status(400).send("Some errors occurred");
    }
})
router.post('/user/reset-password',async(req,res)=>{
    try{
        const {email, newPassword}=req.body;
        const {errors, isValid} = validateResetPassword(newPassword);
        console.log(errors, isValid);
        if(!isValid){
            res.status(400).send(errors);
            return;
        }

        User.findOne({email:email})
            .then(user=>{
                if(user){
                    
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newPassword,salt,(err,hash)=>{
                            if(err)throw err;
                            user.password=hash;
                            let update={
                                password:user.password
                            }
                            User.updateOne({email:email},{$set:update},(err,result)=>{
                                if(err){
                                    return res.status(400).send("Unable to update user.");
                                } else {
                                    return res.status(200).send("User updated successfully.");
                                }
                            })
                        });
                    });
                } else{
                    res.status(400).send('Can not found user with '+ email);
                }
            })
    }catch(error){
        res.status(400).send('Some errors occurred while resetting your password...');
    }
});
router.post('/user/get-image', async(req, res)=>{
    try{
        const candidateList = req.body;
        console.log('body: ', req.body);
        for (let i=0;i<candidateList.length;i++){
            const fileName = candidateList[i].avatarUrl;
            const photo = fs.readFileSync(`${tempFilePath}/${fileName}.png`);
            const base64String = new Buffer.from(photo).toString('base64');
        
            candidateList[i].base64Image= base64String;
        }
        res.status(200).send({candidateList:candidateList});

    } catch(error){

    }
})
module.exports=router;