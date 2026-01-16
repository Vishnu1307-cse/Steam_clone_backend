import Purchase from "../models/Purchase.js";

export const getMyLibrary = async (req, res) => {
  const userId = req.user.id;

  const purchases = await Purchase.find({ user: userId })
    .populate("game");

  res.json(purchases.map(p => p.game));
};
