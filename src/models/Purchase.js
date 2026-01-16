import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },

    priceAtPurchase: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Prevent double purchase
purchaseSchema.index({ user: 1, game: 1 }, { unique: true });

export default mongoose.model("Purchase", purchaseSchema);
