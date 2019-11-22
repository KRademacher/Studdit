const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	content: { type: String, required: true },
	createdAt: Date,
	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'comment'
	}],
	author: {
		type: String,
		required: true
	}
});

//Adds creation date automatically
CommentSchema.pre('save', function(next) {
	const date = new Date();
	if (!this.createdAt) {
		this.createdAt = date;
	}
	next();
});

const Comment = mongoose.model('comment', CommentSchema);
module.exports = CommentSchema;