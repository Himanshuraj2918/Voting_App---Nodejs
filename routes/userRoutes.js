const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/user");
const {jwtAuthMiddleware,sendMail,transporter} = require('../function')
const jwt = require("jsonwebtoken")
require("dotenv").config()

router.post('/signup', async (req, res) => {
    try {
        const newUser = req.body;

        // Check for missing required fields
        if (!newUser.name || !newUser.age || !newUser.address || !newUser.aadharCardNumber || !newUser.password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
          
        if(newUser.role === "admin"){
          const  existingAdmin = await User.findOne({role: newUser.role})
          if(existingAdmin){
            return res.status(400).json({
                error:"Admin already exists"
            })
          }
        }
        // Check if the user already exists
        const existingUser = await User.findOne({ aadharCardNumber: newUser.aadharCardNumber });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Encrypt the password
        const encryptedPassword = await bcrypt.hash(newUser.password, 10);

        // Create the user with the spread operator to include newUser properties
        const user = await User.create({
            ...newUser, // Spread the newUser properties
            password: encryptedPassword, // Set the encrypted password
        }).then(
             sendMail(transporter,newUser.email) // Sending mail to registered user 
        )

        const payload = {
            id : user._id
        }
        
        const token = jwt.sign(payload,process.env.JWT_SECRET)
       
        user.password = undefined;

        res.status(201).json({
            success: true,
            msg: "User successfully registered",
            user: user ,// Optionally return the created user data
            token
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/login',async(req,res)=>{
    const {aadharCardNumber,password} = req.body;

    if(!(aadharCardNumber && password)){
        res.status(400).json({msg:"All fields are required"});
    }

    try {
        // Find the user by Aadhar Card Number
        const user = await User.findOne({ aadharCardNumber });

        // Check if the user exists
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        if( !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({msg:"Invalid credentials"})
        }

        const payload = {
            id : user._id
        }
        
        const token = jwt.sign(payload,process.env.JWT_SECRET)
       
        res.status(200).json({
            success:true,
            token
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
    

})

router.get("/profile",jwtAuthMiddleware,async(req,res)=>{

    const userId = req.user.id;
    const user = await User.findById(userId );
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }
   user.password = undefined;
   res.status(200).json({
    success:true,
    user
   })
})

router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{

    const userId = req.user.id;
    const{currentPassword,newPassword} = req.body;

    const user = await User.findById(userId );
    

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }
    
    if( !(await bcrypt.compare(currentPassword, user.password))){
        return res.status(400).json({msg:"Invalid credentials"})
    }
    
    user.password =  await bcrypt.hash(newPassword, 10)
    await user.save();

    res.status(200).json({msg:"Password Updated"})
})
 
module.exports = router;
