const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure emails are unique
  },
  party: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true // Ensure aadharCardNumber is unique
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now // Default to current date/time
      }
    }
  ],
  voteCount: {
    type: Number,
    default: 0
  }
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
