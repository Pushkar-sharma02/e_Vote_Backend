const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');

const checkAdminRole = async (userID) => {
   try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
   }catch(err){
        return false;
   }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const { name, party, electionType, age } = req.body;

    const newCandidate = new Candidate({
      name,
      party,
      electionType,
      age
    });

    const response = await newCandidate.save();
    res.status(200).json({ response });
  } catch (err) {
    console.error('Error saving candidate:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//to delete a candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the user has an admin role
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    // Extract the candidate ID from the URL parameter
    const candidateID = req.params.candidateID;

    // Find the candidate by ID and delete it
    const response = await Candidate.findByIdAndDelete(candidateID);

    // If no candidate is found, return a 404 error
    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Log the deletion and send a success response
    console.log('Candidate deleted:', response);
    res.status(200).json({ message: 'Candidate deleted successfully', candidate: response });
  } catch (err) {
    // Log the error and send a 500 internal server error response
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// let's start voting
// Route to vote for a candidate by ID
router.get('/vote/candidate/:candidateId', jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    // Find the candidate by ID
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is an admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin is not allowed to vote' });
    }

    // Check if the user has already voted
    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Add the user's vote to the candidate
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // Mark the user as voted
    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error('Error voting for candidate:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// vote count 
router.get('/count',  async (req, res) => {
  try {
    //const user = await User.findById(req.user.id);

    const candidates = await Candidate.find().sort({ voteCount: 'desc' });
    const voteRecord = candidates.map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      count: candidate.voteCount,
      electionType: candidate.electionType,
    }));

    console.log("Into voting count");
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("out of voting count");
  }
});

// Get List of all candidates with only name and party fields
// GET route to fetch candidates by election type
// Backend route to fetch candidates by election type
router.get('/elections/:electionType', async (req, res) => {
  try {
    const { electionType } = req.params;
    //console.log('Election Type:', electionType); // Log the election type parameter
    
    let candidates;
    if (electionType === "loksabha") {
      candidates = await Candidate.find({ electionType: "LokSabha" });
    } else if (electionType === "stateassembly") {
      candidates = await Candidate.find({ electionType: "StateAssembly" });
    } else {
      return res.status(400).json({ message: 'Invalid election type' });
    }
    
    console.log('Fetched Candidates:', candidates); // Log the fetched candidates
    
    res.status(200).json(candidates);
  } catch (err) {
    console.error('Error fetching candidates by election type:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
});



module.exports = router;