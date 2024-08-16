const express = require("express")
const app = express();
const PORT = process.env.PORT || 3000;
const db = require("./db")
require("dotenv").config()


app.use(express.json())
const bodyParser = require("body-parser");
app.use(bodyParser.json())

const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')

app.use('/user',userRoutes)
app.use('/candidate',candidateRoutes)


app.listen(PORT,()=>{
    console.log(`Server started ${PORT}...............`);
})
