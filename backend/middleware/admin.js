const adminMiddleware = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  const expectedAdminKey = process.env.ADMIN_KEY || "ecoscrap-admin";

  if (!adminKey || adminKey !== expectedAdminKey) {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

module.exports = adminMiddleware;
