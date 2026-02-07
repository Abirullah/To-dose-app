export const requireSelf = (req, res, next) => {
  const paramUserId = req.params.userId;
  if (!paramUserId) {
    return res.status(400).json({ error: "Missing userId param" });
  }

  if (req.user?._id?.toString() !== String(paramUserId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
};

