// Mock AI: suggest art style from image (placeholder logic - no real ML)
const STYLES = ['Portrait', 'Mandala', 'Sketch', 'Wall painting', 'Digital art', 'Traditional', 'Abstract', 'Minimalist'];

exports.suggestStyle = async (req, res) => {
  try {
    // In production: call vision API (e.g. TensorFlow, Clarifai) with req.file
    // Mock: deterministic "prediction" based on filename/random
    const seed = req.file
      ? req.file.originalname.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      : Date.now();
    const suggested = STYLES[seed % STYLES.length];
    const alternatives = STYLES.filter(s => s !== suggested).slice(0, 3);
    res.json({
      success: true,
      suggested,
      alternatives,
      message: 'Style suggestion (mock). Connect a vision API for real analysis.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
