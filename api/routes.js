const express = require('express');
const routes = express.Router();

const Comment = require('../controllers/comment.controller');
const Thread = require('../controllers/thread.controller');
const User = require('../controllers/user.controller');

//Comment routes
routes.post('/comment', Comment.create);
routes.put('/comment/:id', Comment.update);
routes.delete('/comment/:id', Comment.delete);

//Thread routes
routes.post('/thread', Thread.create);
routes.put('/thread/:id', Thread.update);
routes.delete('/thread/:id', Thread.delete);

routes.get('/thread', Thread.get);
routes.get('/thread/:id', Thread.getById);

routes.put('/thread/upvote/:id', Thread.upvote);
routes.put('/thread/downvote/:id', Thread.downvote);

//User routes
routes.post('/user', User.create);
routes.put('/user/:id', User.update);
routes.delete('/user/:id', User.delete);

routes.post('/user/addFriend', User.addFriend);
routes.delete('/user/deleteFriend', User.deleteFriend);

module.exports = routes;