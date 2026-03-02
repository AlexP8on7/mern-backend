exports.getStatus = (req, res) => {
  res.json({
    status: "Online",
    message: "AWS Backend is reachable!",
    owner: "Fergus Downey",
    timestamp: new Date()
  });
};
