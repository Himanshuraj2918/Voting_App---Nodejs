const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");
const {jwtAuthMiddleware,sendMail,transporter} = require('../function')
require("dotenv").config()



const checkAdminRole = async (userID)=>{
    try {
        
        const user = await User.findById(userID);
        
        return user.role === "admin"
    } catch (error) {
        return false;
    }
}
router.post('/', jwtAuthMiddleware,async (req, res) => {
    try {
        

         if(!await checkAdminRole(req.user.id)){
              return res.status(403).json({msg:"User has not admin access"})
         }

        const newUser = req.body;

        // Check for missing required fields
        if (!newUser.name || !newUser.age || !newUser.party || !newUser.aadharCardNumber || !newUser.email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if the user already exists
        const existingUser = await Candidate.findOne({ aadharCardNumber: newUser.aadharCardNumber });

        if (existingUser) {
            return res.status(400).json({ error: "Candidate already exists" });
        }

        // Create the user with the spread operator to include newUser properties
        const user = await Candidate.create(newUser)
        .then(
            sendMail(transporter,newUser.email) // Sending mail to registered candidate using nodemailer 
       );
        res.status(201).json({
            success: true,
            msg: "Candidate successfully registered",
        });
    } catch (error) {
        console.error("Error during candidate registration:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.put('/:candidateID',async(req,res)=>{
    if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({msg:"Candidate has not admin access"})
   }
    const userId = req.params.candidateID;
    const updatePersonData= req.body;

    const response = await Candidate.findByIdAndUpdate(userId,updatePersonData,{
        new:true,
        runValidators:true
    })
    
  if(!response){
    return res.status(404).json({msg:"Candidate not found"})
  }

    res.status(200).json(response)
})


router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({msg:"Candidate has not admin access"})
   }
    const userId = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(userId)
    
  if(!response){
    return res.status(404).json({msg:"Candidate not found"})
  }

    res.status(200).json({msg:"candidate deleted"})
})

router.post('/vote/:candidateID',jwtAuthMiddleware, async(req,res)=>{
    //no admin can voteCount
    //user can vote only one time

    const candidateID = req.params.candidateID;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID);
        
        if(!candidate){
            return res.status(404).json({msg:"Candidate not found"})
        }

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({msg:"Candidate not found"})
        }

        if(user.isVoted){
            return res.status(400).json({msg:"User already voted"})
        }

        if(user.role === 'admin'){
            return res.status(400).json({msg:"Admin is not allowed"})
        }
        
        candidate.votes.push({user:userId})
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({msg:"Vote recorded successfully"})


    } catch (error) {
        console.error("Error during voting:", error);
        res.status(500).json({ error: "Server error" });
    }
})

//vote count

router.get('/vote/count',async(req,res)=>{

    try {
        
        const candidate = await Candidate.find().sort({voteCount:'desc'});

        const record = candidate.map((data)=>{
            return{
                part:data.party,
                count:data.voteCount
            }

        })

        return res.status(200).json(record)

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})


 
module.exports = router;
