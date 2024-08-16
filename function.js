const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");


const jwtAuthMiddleware = (req,res,next)=>{
    const authorization = req.headers.authorization

    if(!authorization) return res.status(400).json({error:"Token not found"})

    const token = req.headers.authorization.split(' ')[1];

    if(!token) return res.status(400).json({error:"Unauthorized"})

    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decode
        next()
    } catch (error) {
        console.error(error);
        res.status(401).json({error:"Invalid token"})
        
    }

}

  //************************************ */ Node mailer code start from here *****************************************

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.USER, //Sender gmail address
      pass: process.env.APP_PASSWORD, // App password from Gmail
    },
  });

 

  const sendMail = async (transporter, email) => {

    const mailOptions = {
        from: {
          name: "E-Voting",
          address: process.env.USER,
        },
        to: email,
        subject: "Successfully Registered in E-Voting App",
        html: `<pre>Congratulations! </pre>
        You have successfully registered for the E-Voting App. Your participation in this digital voting platform is highly valued. Get ready to make your voice heard and contribute to a brighter future. Thank you for joining us !<br>
<pre>
Best regards,
The E-Voting Team
</pre>
                `,
      };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email has been send");
    } catch (error) {
      console.error(error);
    }
  };


module.exports = {
    jwtAuthMiddleware,
    sendMail,
    transporter
}