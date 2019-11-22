const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = require("../models/comment");

const ThreadSchema = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	createdAt: Date,
	comments: [CommentSchema],
	username: { type: String, required: true},
	upvotes: [String],
	downvotes: [String]
}, {
	toJSON: { virtuals: true }
});

//Adds creation date automatically
ThreadSchema.pre('save', function(next) {
	const date = new Date();
	if (!this.createdAt) {
		this.createdAt = date;
	}
	next();
});

ThreadSchema.virtual('Upvotes').get(function() {
	return this.upvotes.length;
});

ThreadSchema.virtual('Downvotes').get(function() {
	return this.downvotes.length;
});

ThreadSchema.virtual('Rating').get(function() {
	return (this.upvotes.length - this.downvotes.length);
});

const Thread = mongoose.model('thread', ThreadSchema);
module.exports = Thread;