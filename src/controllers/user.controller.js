import User from "../models/User.js";

/**
 * GET /users/me
 * Read own profile
 */
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

/**
 * PUT /users/me
 * Update own profile (limited fields)
 */
export const updateMe = async (req, res) => {
  const allowedUpdates = ["username", "email"];
  const updates = {};

  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  ).select("-passwordHash");

  res.json(user);
};

/**
 * DELETE /users/me
 * Soft delete own account
 */
export const deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    isBanned: true,
    banReason: "User self-deleted account"
  });

  res.json({ message: "Account deactivated" });
};
