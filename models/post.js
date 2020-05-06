const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  message: { type: String, min: 2, max: 100, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model('Post', PostSchema);
