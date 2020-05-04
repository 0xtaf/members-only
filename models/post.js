const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, min: 2, max: 100, required: true },
  message: { type: String, min: 2, max: 100, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model('Post', PostSchema);
