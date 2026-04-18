import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Frontend", "Backend", "DevOps", "Architecture", "Payments", "AI/ML", "Database", "Other"],
      default: "Other",
    },
    urgency: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Open", "Solved"],
      default: "Open",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Request || mongoose.model("Request", requestSchema);
