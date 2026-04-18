import Request from "../models/Request.js";

// Create a new request
export const createRequest = async (req, res) => {
  try {
    const { title, description, category, urgency, tags } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newRequest = await Request.create({
      title,
      description,
      category: category || "Other",
      urgency: urgency || "Medium",
      tags: tags || [],
      userId: req.user.userId, // From auth middleware
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error creating request", error: error.message });
  }
};

// Get all requests
export const getRequests = async (req, res) => {
  try {
    // We populate the user to get author info on the frontend
    const requests = await Request.find()
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching requests" });
  }
};

// Get single request
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("userId", "fullName email role");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching request" });
  }
};

// Mark as solved
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only owner can close (in a real app, maybe an assigned helper too)
    if (request.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    request.status = status;
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error updating status" });
  }
};
