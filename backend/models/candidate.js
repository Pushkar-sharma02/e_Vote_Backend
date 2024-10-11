const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const shortid = require('shortid');

// Define the Person schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [
        {   //this is a nested object
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount: {
        type: Number, //object count  =  no. of votes
        default: 0
    },
    uniqueId: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    electionType: {
        type: String,
        enum: ['LokSabha', 'StateAssembly'],
        required: true
      },
});
// Compound index to ensure unique party for each election type
//candidateSchema.index({ party: 1, electionType: 1 }, { unique: true });

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
