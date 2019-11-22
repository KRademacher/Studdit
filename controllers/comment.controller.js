const Thread = require('../models/thread');
const Driver = require('../neo4jdriver');

module.exports = {

	//Add a comment
	create(req, res, next) {
		var user = req.body.username;
		var content = req.body.content;
		var parentId = req.body.parentId;
		var nestedComment = req.body.nestedComment;

		const session = Driver.session();

		//Check if user exists
		session.run(`MATCH (u:User) WHERE u.name = $name RETURN u`, { name: user }
			).then((users) => {
				if (users.records.length === 0) {
					session.close();
					res.status(400).send({ Message: 'User was not found.'});
				} else { //If it is a root comment
					if (nestedComment === 'false') {
						Thread.findOne({ _id: parentId })
							.then((resultThread) => {
								if (resultThread === null) { //Check if Thread exists.
									res.status(400).send({ Message: 'Thread was not found.' });
								} else {
									resultThread.comments.push({
										author: user,
										content: content
									});
									resultThread.save();

									res.status(200).send({ Message: 'Comment successfully added to Thread.'});
								}
							}).catch(next);
					} else { //If it *is* a nested comment
						Thread.findOne({ "comments._id": parentId })
							.then((resultThread) => {
								if (resultThread === null) {
									res.status(400).send({ Message: 'Parent comment was not found.'});
								} else {
									var parentComment = resultThread.comments.id(parentId);
									var comment = {
										author: user,
										content: content
									};
									var i = parentComment.comments.length;
									parentComment.comments[i] = comment;
									//res.send(comments);
									//parentComment.comments = comments;
									//res.send(parentComment.comments);
									resultThread.save();

									res.status(200).send({ Message: 'Comment was successfully added to Parent comment.'});
								}
							}).catch(next);
					}
					session.close();
				}
			}).catch(next);
	},

	//Update a comment 
	update(req, res, next) {
		Thread.findOne({ "comments._id": req.params.id })
			.then((thread) => {
				if (thread === null) { //Check if comment exists.
					res.status(400).send({ Message: 'Comment was not found.'});
				} else {
					var comment = thread.comments.id(req.params.id);
					comment.content = req.body.content;
					thread.save();
					res.status(200).send({ Message: 'Comment edited successfully.'});
				}
			}).catch(next);
	},

	delete(req, res, next) {
		Thread.findOne({ "comments._id": req.params.id })
			.then((thread) => {
				if (thread === null) { //Check if comment exists beforehand
					res.status(400).send({ Message: 'Comment was not found.' });
				} else {
					var comment = thread.comments.id(req.params.id);
					thread.comments.pull(comment)
					thread.save();
					res.status(200).send({ Message: 'Comment was successfully deleted.'});
				}
			}).catch(next);
	}
}