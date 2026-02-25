import Game from "../models/Game.js";

/**
 * READ: Get all games (public)
 */
export const getAllGames = async (req, res) => {
  const games = await Game.find({ isDeleted: false })
    .populate("uploadedBy", "username");

  res.json(games);
};

/**
 * READ: Get single game (public)
 */
export const getGameById = async (req, res) => {
  const game = await Game.findOne({
    _id: req.params.id,
    isDeleted: false
  }).populate("uploadedBy", "username");

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  res.json(game);
};

/**
 * CREATE: Upload game (user)
 */
export const createGame = async (req, res) => {
  try {
    const { title, description, price, coverImage } = req.body;

    const game = await Game.create({
      title,
      description,
      price,
      coverImage,
      uploadedBy: req.user.id
    });

    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};

export const searchGamesByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const games = await Game.find({
    title: { $regex: name, $options: "i" },
    isDeleted: false
  }).populate("uploadedBy", "username");

  res.json(games);
};

/**
 * UPDATE: Only creator can update
 */
export const updateGame = async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  if (game.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const allowedUpdates = ["title", "description", "price", "coverImage"];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      game[field] = req.body[field];
    }
  });

  await game.save();

  res.json(game); // 👈 MUST return updated game
};


/**
 * DELETE: Only creator can delete (soft delete)
 */
export const deleteGame = async (req, res) => {
  const game = await Game.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  if (game.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  game.isDeleted = true;
  await game.save();

  res.json({ message: "Game deleted" });
};

export const getMyGames = async (req, res) => {
  try {
    const games = await Game.find({
      uploadedBy: req.user.id,
      isDeleted: false
    }).populate("uploadedBy", "username email");

    res.json(games);
  } catch (err) {
    console.error("Get my games error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
