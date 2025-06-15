
"use client";
import React, { useState, useEffect } from "react";

// ------------------------------
// Helper: Compute SHA‑256 hash using Web Crypto API
// ------------------------------
async function computeHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ------------------------------
// Simulated Database: Using localStorage
// ------------------------------
const getCandidatesFromStorage = () => {
  const data = localStorage.getItem("candidates");
  return data ? JSON.parse(data) : [];
};

const getBlocksFromStorage = () => {
  const data = localStorage.getItem("blocks");
  return data ? JSON.parse(data) : [];
};

const getVotersFromStorage = () => {
  const data = localStorage.getItem("voters");
  return data ? JSON.parse(data) : [];
};

const saveCandidatesToStorage = (candidates) => {
  localStorage.setItem("candidates", JSON.stringify(candidates));
};

const saveBlocksToStorage = (blocks) => {
  localStorage.setItem("blocks", JSON.stringify(blocks));
};

const saveVotersToStorage = (voters) => {
  localStorage.setItem("voters", JSON.stringify(voters));
};

// ------------------------------
// Background Component
// ------------------------------
const BackgroundStatic = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------
// Modal Component (for viewing block details)
// ------------------------------
const BlockModal = ({ isOpen, block, onClose }) => {
  if (!isOpen || !block) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <h3>Block Details</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: "14px" }}>
          <p>
            <strong>Index:</strong> {block.index}
          </p>
          <p>
            <strong>Timestamp:</strong> {block.timestamp}
          </p>
          <p>
            <strong>Candidate:</strong>{" "}
            {block.candidateId === "GENESIS" ? "Genesis" : block.candidateName}
          </p>
          {block.gender && (
            <p>
              <strong>Gender:</strong> {block.gender}
            </p>
          )}
          {block.wallet && (
            <p>
              <strong>Voter Wallet:</strong> {block.wallet}
            </p>
          )}
          <p>
            <strong>Previous Hash:</strong> {block.previousHash}
          </p>
          <p>
            <strong>Hash:</strong> {block.hash}
          </p>
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// Main Election App Component
// ------------------------------
const Paper = () => {
  const [page, setPage] = useState("connection");
  const [candidates, setCandidates] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [results, setResults] = useState({});
  const [walletAddress, setWalletAddress] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  // New candidate registration fields including gender
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateParty, setNewCandidateParty] = useState("");
  const [newCandidateGender, setNewCandidateGender] = useState("");
  const [newCandidateWallet, setNewCandidateWallet] = useState("");
  const [newCandidateDeposit, setNewCandidateDeposit] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalBlock, setModalBlock] = useState(null);
  // Reward distribution details
  const [rewardDetails, setRewardDetails] = useState(null);
  // ------------------------------
  // Election Timer State (new additions)
  // ------------------------------
  const [electionDuration, setElectionDuration] = useState(""); // in minutes
  const [electionEndTime, setElectionEndTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  // ------------------------------
  // New Voter Registration State
  // ------------------------------
  const [voters, setVoters] = useState([]);
  const [newVoterName, setNewVoterName] = useState("");
  const [newVoterPRN, setNewVoterPRN] = useState("");
  const [newVoterGender, setNewVoterGender] = useState("");

  // Check for an existing election end time on mount
  useEffect(() => {
    const storedEndTime = localStorage.getItem("electionEndTime");
    if (storedEndTime) {
      const parsedEndTime = new Date(storedEndTime);
      setElectionEndTime(parsedEndTime);
      if (new Date() < parsedEndTime) {
        // If election is still ongoing, go directly to voting page
        setPage("candidates");
      }
    }
    // Also load registered voters if any
    const storedVoters = getVotersFromStorage();
    if (storedVoters.length > 0) {
      setVoters(storedVoters);
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ------------------------------
  // Initialize Data (from localStorage)
  // ------------------------------
  useEffect(() => {
    const initializeData = async () => {
      const storedCandidates = getCandidatesFromStorage();
      if (storedCandidates.length > 0) {
        setCandidates(storedCandidates);
      }

      let storedBlocks = getBlocksFromStorage();
      if (storedBlocks.length > 0) {
        setBlockchain(storedBlocks);
        // Calculate vote counts
        const counts = {};
        storedBlocks.forEach((block) => {
          if (block.candidateId !== "GENESIS") {
            counts[block.candidateId] = (counts[block.candidateId] || 0) + 1;
          }
        });
        setResults(counts);
      } else {
        // Create genesis block if no blocks exist
        const genesisBlock = {
          index: 0,
          timestamp: new Date().toISOString(),
          candidateId: "GENESIS",
          candidateName: "Genesis",
          previousHash: "0",
          hash: "",
        };
        genesisBlock.hash = await computeHash(JSON.stringify(genesisBlock));
        const newBlocks = [genesisBlock];
        setBlockchain(newBlocks);
        saveBlocksToStorage(newBlocks);
      }
    };

    initializeData();

    // Polling for updates every 5 seconds
    const pollInterval = setInterval(() => {
      const latestCandidates = getCandidatesFromStorage();
      const latestBlocks = getBlocksFromStorage();
      setCandidates(latestCandidates);
      setBlockchain(latestBlocks);
      const newCounts = {};
      latestBlocks.forEach((block) => {
        if (block.candidateId !== "GENESIS") {
          newCounts[block.candidateId] = (newCounts[block.candidateId] || 0) + 1;
        }
      });
      setResults(newCounts);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // ------------------------------
  // Wallet Connection (for voters)
  // ------------------------------
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error("User rejected wallet connection", err);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to vote.");
    }
  };

  // ------------------------------
  // Add Candidate (with wallet, deposit, and gender)
  // ------------------------------
  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (
      newCandidateName.trim() === "" ||
      newCandidateParty.trim() === "" ||
      newCandidateGender.trim() === "" ||
      newCandidateWallet.trim() === "" ||
      newCandidateDeposit.trim() === ""
    ) {
      alert("Please provide candidate name, party, gender, wallet, and deposit amount.");
      return;
    }
    const deposit = parseFloat(newCandidateDeposit);
    if (isNaN(deposit) || deposit <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }
    const newCandidate = {
      id: "c" + (candidates.length + 1).toString(),
      name: newCandidateName,
      party: newCandidateParty,
      gender: newCandidateGender,
      wallet: newCandidateWallet,
      deposit: deposit,
    };
    const updatedCandidates = [...candidates, newCandidate];
    setCandidates(updatedCandidates);
    saveCandidatesToStorage(updatedCandidates);
    setNewCandidateName("");
    setNewCandidateParty("");
    setNewCandidateGender("");
    setNewCandidateWallet("");
    setNewCandidateDeposit("");
  };

  // ------------------------------
  // Add Voter (registering voter with name, PRN and gender)
  // ------------------------------
  const handleAddVoter = (e) => {
    e.preventDefault();
    if (
      newVoterName.trim() === "" ||
      newVoterPRN.trim() === "" ||
      newVoterGender.trim() === ""
    ) {
      alert("Please fill in all voter details.");
      return;
    }
    const newVoter = {
      id: "v" + (voters.length + 1).toString(),
      name: newVoterName,
      prn: newVoterPRN,
      gender: newVoterGender,
    };
    const updatedVoters = [...voters, newVoter];
    setVoters(updatedVoters);
    saveVotersToStorage(updatedVoters);
    setNewVoterName("");
    setNewVoterPRN("");
    setNewVoterGender("");
  };

  // ------------------------------
  // Handle Voting
  // ------------------------------
  const handleVote = async (candidateId) => {
    if (!walletAddress) {
      alert("Please connect your MetaMask wallet before voting.");
      return;
    }
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const previousBlock = blockchain[blockchain.length - 1];
    const newBlock = {
      index: previousBlock.index + 1,
      timestamp: new Date().toISOString(),
      candidateId: candidate.id,
      candidateName: candidate.name,
      gender: candidate.gender, // Include candidate gender
      wallet: walletAddress, // voter wallet
      previousHash: previousBlock.hash,
      hash: "",
    };
    newBlock.hash = await computeHash(JSON.stringify(newBlock));

    const updatedBlocks = [...blockchain, newBlock];
    setBlockchain(updatedBlocks);
    saveBlocksToStorage(updatedBlocks);
    setHasVoted(true);
    setSelectedCandidate(candidate.id);
    setResults((prev) => ({
      ...prev,
      [candidate.id]: (prev[candidate.id] || 0) + 1,
    }));

    setPage("afterVote");
  };

  // ------------------------------
  // Reward Winner: Calculate winner and distribute 75% of candidate deposits
  // ------------------------------
  const rewardWinner = () => {
    let winnerId = null;
    let maxVotes = -1;
    for (const id in results) {
      if (results[id] > maxVotes) {
        maxVotes = results[id];
        winnerId = id;
      }
    }
    if (!winnerId) {
      alert("No votes recorded yet.");
      return;
    }
    const winnerCandidate = candidates.find((c) => c.id === winnerId);
    if (!winnerCandidate) {
      alert("Winner candidate not found.");
      return;
    }
    const totalDeposits = candidates.reduce((sum, candidate) => sum + candidate.deposit, 0);
    const rewardAmount = totalDeposits * 0.75;
    setRewardDetails({
      winner: winnerCandidate,
      reward: rewardAmount,
    });
  };

  // ------------------------------
  // Render Different Pages
  // ------------------------------

  // Connection Page: Only show election duration input if wallet is connected.
  if (page === "connection") {
    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Student Election 2025</h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Blockchain-Based Voting System</p>
          {walletAddress ? (
            <>
              <p style={{ color: "lightgreen" }}>Connected Wallet: {walletAddress}</p>
              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Election Duration (minutes):</label>
                <input
                  type="number"
                  value={electionDuration}
                  onChange={(e) => setElectionDuration(e.target.value)}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100px", marginBottom: "10px" }}
                  placeholder="Duration"
                />
              </div>
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => {
                    if (!electionDuration) {
                      alert("Please enter election duration in minutes.");
                      return;
                    }
                    const newEndTime = new Date(new Date().getTime() + parseInt(electionDuration) * 60000);
                    setElectionEndTime(newEndTime);
                    localStorage.setItem("electionEndTime", newEndTime.toISOString());
                    setPage("candidates");
                  }}
                  style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }}
                >
                  Proceed
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={connectWallet}
                style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}
              >
                Connect Wallet
              </button>
              <p>Please connect your MetaMask wallet before voting.</p>
            </>
          )}
        </div>
      </BackgroundStatic>
    );
  }

  // Candidates Page (Candidate Registration)
  if (page === "candidates") {
    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", color: "#fff" }}>
          {/* Prompt to connect wallet if not connected */}
          {!walletAddress && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p>Please connect your MetaMask wallet before voting.</p>
              <button
                onClick={connectWallet}
                style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}
              >
                Connect Wallet
              </button>
            </div>
          )}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Add Candidate</h2>
            <form onSubmit={handleAddCandidate} style={{ backgroundColor: "#333", padding: "20px", borderRadius: "8px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Candidate Name</label>
                <input
                  type="text"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  placeholder="Enter candidate name"
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Party</label>
                <input
                  type="text"
                  value={newCandidateParty}
                  onChange={(e) => setNewCandidateParty(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  placeholder="Enter party name"
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Gender</label>
                <input
                  type="text"
                  value={newCandidateGender}
                  onChange={(e) => setNewCandidateGender(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  placeholder="Enter candidate gender"
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Wallet Address</label>
                <input
                  type="text"
                  value={newCandidateWallet}
                  onChange={(e) => setNewCandidateWallet(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  placeholder="Enter candidate wallet address"
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Deposit Amount (Test Tokens)</label>
                <input
                  type="number"
                  value={newCandidateDeposit}
                  onChange={(e) => setNewCandidateDeposit(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                  placeholder="Enter deposit amount"
                />
              </div>
              <button
                type="submit"
                style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }}
              >
                Add Candidate
              </button>
            </form>
          </section>

          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Candidates</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    backgroundColor: "#333",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#6c63ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {candidate.name.charAt(0)}
                  </div>
                  <h3>{candidate.name}</h3>
                  <p style={{ marginBottom: "5px" }}>{candidate.party}</p>
                  {candidate.gender && (
                    <p style={{ marginBottom: "5px", fontSize: "0.9rem" }}>Gender: {candidate.gender}</p>
                  )}
                  <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Fee: {candidate.deposit} tokens</p>
                  <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Wallet: {candidate.wallet}</p>
                  <button
                    onClick={() => handleVote(candidate.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginTop: "10px",
                    }}
                  >
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </section>
          {/* NEW: Proceed to Voter Registration if at least one candidate exists */}
          {candidates.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setPage("registerVoters")}
                style={{ padding: "10px 20px", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px" }}
              >
                Proceed to Voter Registration
              </button>
            </div>
          )}
        </div>
      </BackgroundStatic>
    );
  }

  // ------------------------------
  // Voter Registration Page
  // ------------------------------
  if (page === "registerVoters") {
    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", color: "#fff" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Register Voters</h2>
          <form onSubmit={handleAddVoter} style={{ backgroundColor: "#333", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Voter Name</label>
              <input
                type="text"
                value={newVoterName}
                onChange={(e) => setNewVoterName(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                placeholder="Enter voter name"
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>PRN</label>
              <input
                type="text"
                value={newVoterPRN}
                onChange={(e) => setNewVoterPRN(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                placeholder="Enter PRN"
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Gender</label>
              <input
                type="text"
                value={newVoterGender}
                onChange={(e) => setNewVoterGender(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                placeholder="Enter gender"
              />
            </div>
            <button
              type="submit"
              style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Add Voter
            </button>
          </form>
          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Registered Voters</h3>
            {voters.length > 0 ? (
              voters.map((voter) => (
                <div key={voter.id} style={{ backgroundColor: "#444", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                  {voter.name} - {voter.prn} - {voter.gender}
                </div>
              ))
            ) : (
              <p>No voters registered yet.</p>
            )}
          </section>
          {voters.length > 0 && (
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <button
                onClick={() => setPage("voting")}
                style={{ padding: "10px 20px", backgroundColor: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px", marginRight: "10px" }}
              >
                Proceed to Voting
              </button>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setPage("candidates")}
              style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Back to Candidate Registration
            </button>
          </div>
        </div>
      </BackgroundStatic>
    );
  }

  // ------------------------------
  // Voting Page (Candidates with vote buttons)
  // ------------------------------
  if (page === "voting") {
    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", color: "#fff" }}>
          <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "20px" }}>Voting</h2>
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Candidates</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    backgroundColor: "#333",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#6c63ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {candidate.name.charAt(0)}
                  </div>
                  <h3>{candidate.name}</h3>
                  <p style={{ marginBottom: "5px" }}>{candidate.party}</p>
                  {candidate.gender && (
                    <p style={{ marginBottom: "5px", fontSize: "0.9rem" }}>Gender: {candidate.gender}</p>
                  )}
                  <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Fee: {candidate.deposit} tokens</p>
                  <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Wallet: {candidate.wallet}</p>
                  <button
                    onClick={() => handleVote(candidate.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginTop: "10px",
                    }}
                  >
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </section>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setPage("results")}
              style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", marginRight: "10px" }}
            >
              View Real Time Results
            </button>
            <button
              onClick={() => setPage("connection")}
              style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </BackgroundStatic>
    );
  }

  // After Vote Page
  if (page === "afterVote") {
    const candidate = candidates.find((c) => c.id === selectedCandidate);
    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Thank you for voting!</h2>
          <p style={{ marginBottom: "20px" }}>
            {candidate ? `You voted for ${candidate.name}` : "Vote recorded."}
          </p>
          <button
            onClick={() => setPage("results")}
            style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }}
          >
            View Results
          </button>
        </div>
      </BackgroundStatic>
    );
  }

  // Results Page
  if (page === "results") {
    if (electionEndTime && currentTime < electionEndTime) {
      const timeLeft = Math.ceil((electionEndTime - currentTime) / 1000);
      return (
        <BackgroundStatic>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <h2>Election is still ongoing</h2>
            <p>Results will be available in {timeLeft} seconds.</p>
          </div>
        </BackgroundStatic>
      );
    }
    const chartData = candidates.map((candidate) => ({
      name: candidate.name,
      votes: results[candidate.id] || 0,
    }));
    const maxVotes = Math.max(...chartData.map((d) => d.votes), 1);

    return (
      <BackgroundStatic>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", color: "#fff" }}>
          <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "20px" }}>Election Results</h2>
          <div style={{ backgroundColor: "#333", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            {chartData.map((data, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <div>
                  {data.name} ({data.votes} votes)
                </div>
                <div
                  style={{
                    background: "#82ca9d",
                    height: "20px",
                    width: `${(data.votes / maxVotes) * 100}%`,
                    transition: "width 0.5s",
                  }}
                ></div>
              </div>
            ))}
          </div>
          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Blockchain Records</h3>
            <div>
              {blockchain.map((block) => (
                <div
                  key={block.index}
                  style={{
                    backgroundColor: "#333",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setModalBlock(block);
                    setShowModal(true);
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc" }}>
                    <span>Block #{block.index}</span>
                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ color: "#aaa", marginTop: "5px" }}>
                    <p>
                      Candidate: {block.candidateId === "GENESIS" ? "Genesis Block" : block.candidateName}
                    </p>
                    {block.gender && (
                      <p style={{ fontSize: "12px" }}>Gender: {block.gender}</p>
                    )}
                    <p style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Hash: {block.hash}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <BlockModal
            isOpen={showModal}
            block={modalBlock}
            onClose={() => {
              setShowModal(false);
              setModalBlock(null);
            }}
          />
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => setPage("candidates")}
              style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", marginRight: "10px" }}
            >
              Back to Voting
            </button>
            <button
              onClick={() => setPage("connection")}
              style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Disconnect
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={rewardWinner}
              style={{ padding: "10px 20px", backgroundColor: "#ff9800", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              Reward Winner
            </button>
          </div>
          {rewardDetails && (
            <div style={{ marginTop: "20px", backgroundColor: "#444", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
              <h3>Winner Reward</h3>
              <p>
                {rewardDetails.winner.name} (Wallet: {rewardDetails.winner.wallet}) wins with {results[rewardDetails.winner.id] || 0} votes.
              </p>
              <p>
                Reward Amount: {rewardDetails.reward.toFixed(2)} test tokens (75% of total candidate deposits).
              </p>
            </div>
          )}
        </div>
      </BackgroundStatic>
    );
  }

  return null;
};

export default Paper;
