const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let moment = require('moment');

const PostSchema = new Schema({
  message: { type: String, min: 2, max: 100, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
});

PostSchema.virtual('formatted').get(function (){
  return this.createdAt ? moment(this.createdAt).format('MMMM Do, YYYY') : '';
})

module.exports = mongoose.model('Post', PostSchema);
