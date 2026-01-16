import Game from "../models/Game.js";
import Purchase from "../models/Purchase.js";

export const purchaseGame = async (req, res) => {

  const userId = req.user.id;
  const gameId = req.params.gameId;

  const game = await Game.findOne({ _id: gameId, isDeleted: false });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  if (game.uploadedBy.toString() === userId) {
    return res.status(403).json({ message: "Cannot purchase your own game" });
  }

  const alreadyPurchased = await Purchase.findOne({
    user: userId,
    game: gameId
  });

  if (alreadyPurchased) {
    return res.status(409).json({ message: "Game already purchased" });
  }

  await Purchase.create({
    user: userId,
    game: gameId,
    priceAtPurchase: game.price
  });

  res.status(201).json({ message: "Game purchased successfully" });
};
