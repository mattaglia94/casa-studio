// Dice all'app se il rilevamento con Claude è attivo e se serve un codice di accesso.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ready: Boolean(process.env.ANTHROPIC_API_KEY),
    needsCode: Boolean(process.env.ACCESS_CODE),
  });
};
