function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
