import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    attachments: [{ type: String }],
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
