const Thread = require('../models/thread');
const Driver = require('../neo4jdriver');

module.exports = {

	create(req, res, next) { //Create a new thread
    const session = Driver.session();
		session.run(`MATCH (u:User) WHERE u.name = $name RETURN u`, { name: req.body.username }) //Look for the username to link the thread to.
      .then((users) =>{
        if (users.records.length === 0) {
          session.close();
          res.status(400).send({ Error:'Username not found' });
        } else {
          let thread = new Thread({
          	title: req.body.title, 
          	content: req.body.content,
          	username: req.body.username
          });
          thread.save() //Return the new thread.
          	.then((threads) => {
              session.close();
            	res.status(200).send({ Message: 'Thread successfully created.'});
          	}).catch(next);
        }
      }).catch(next);
	},

	update(req, res, next) {
		//Give the id of the thread and the new content to change.
		Thread.findByIdAndUpdate({ _id: req.params.id }, { content: req.body.content })
      .then((thread) => {
        if (thread === null) { //Check if thread exists.
          res.status(400).send({ Error: 'Thread does not exist.' });
        } else {
          res.status(200).send({ Error: 'Thread edited successfully.' });
        }
      }).catch(next);
	},

	delete(req, res, next) { //Delete a thread with the given id.
		Thread.findOne({ _id: req.params.id })
      .then((thread) => {
        if (thread === null) { //Check if thread exists.
          res.status(400).send({ Error: 'Thread does not exist.' })
        } else {
          thread.delete()
	          .then(() => Thread.findOne({ _id: req.params.id })) 
  	          .then((thread) => {
  	            if (thread === null) { //Check if thread has been deleted.
  	              res.status(200).send({ Message :'Thread has been removed successfully.' });
  	            }
  	          }).catch(next);
        }
      }).catch(next);
	},

	//Get all threads.
	get(req, res, next) {
		Thread.find({})
      .then((threads) => {
        let items = [];
        threads.forEach(thread => {
        	//Return JSON object with given values.
          let item = {
            'Id': thread._id,
            'username': thread.username,
            'title': thread.title,
            'content':thread.content,
            'upvotes':thread.Upvotes,
            'downvotes':thread.Downvotes
        	};
        	items.push(item);
        });
        res.send(items);
      }).catch(next);
	},

	//Return a single thread with given id.
	getById(req, res, next) {
    Thread.findOne({ _id: req.params.id })
	    .then((thread) => {
        if (thread === null) { //Check if thread exists
          res.status(400).send({ Error: 'Thread does not exist.' });
        } else {
          res.send(thread);
        }
	    }).catch(next);
  },

  //Upvote a thread with a given user.
  upvote(req, res, next) {
    const session = Driver.session();
    Thread.findOne({ _id: req.params.id })
    	.then((thread) => {
	      if (thread === null) { //First check if thread exists.
	          res.status(400).send({ Error: 'Thread does not exist.' });
	      } else {
	      	//If it does exist, look for the user.
	        session.run(`MATCH (u:User) WHERE u.name = $name RETURN u`, 
	        	{ name: req.body.username }
	        	).then((users) => {
		          if (users.records.length === 0) { //Check if user exists.
                session.close();
		            res.status(400).send({ Error:'Username not found.' });
		          } else {
		            for(var i = 0; i < thread.upvotes.length; i++) { //Check if the user has already upvoted this thread.

		              if(thread.upvotes[i] == users.records[0]._fields[0].properties.name) {
		                res.status(200).send({ Message: 'User has already upvoted this thread.' });
                    session.close();
		                return next();
		              }
		            }
		            //Check if the user has downvoted the thread.
		            //If so, remove downvote.
		            for(var i = 0; i < thread.downvotes.length; i++) {
		              
		              if(thread.downvotes[i] == users.records[0]._fields[0].properties.name) {
		                thread.downvotes.remove(users.records[0]._fields[0].properties.name);
		              }
		            }
		            //Lastly, add upvote from user to thread.
		            thread.upvotes.push(users.records[0]._fields[0].properties.name);
		            thread.save();
                session.close();
		            res.status(200).send({ Message:'Upvoted thread.' });
		          }
		        }).catch(next);
	      }
    	}).catch(next);
  },

  //Downvote a thread with a given user.
  downvote(req, res, next) {
    const session = Driver.session();
    Thread.findOne({ _id: req.params.id })
	    .then((thread) => {
        if (thread === null) { //First check if the thread exists.
          res.status(400).send({ Error: 'Thread does not exist.' });
        } else {
        	//Find the given username
          session.run(`MATCH (u:User) WHERE u.name = $name RETURN u`, { name: req.body.username })
	          .then((users) => {
              if (users.records.length === 0) { //Check if user exists.
                session.close();
                res.status(400).send({ Error:'Username not found.' });
              } else {
                for (var i = 0; i<thread.downvotes.length;i++) {
              		//Check if the user has already downvoted given thread.
                  if (thread.downvotes[i] == users.records[0]._fields[0].properties.name)
                  {
                    session.close();
                    res.status(200).send({Message: 'User has already downvoted this thread.'});
                    return next();
                  }
                }
                // Check if user has upvoted thread. If so, remove upvote.
                for(var i = 0; i < thread.upvotes.length; i++) {
                  if (thread.upvotes[i] == users.records[0]._fields[0].properties.name) {
                    thread.upvotes.remove(users.records[0]._fields[0].properties.name);
                  }
                }
              	//Finally, add downvote.
                thread.downvotes.push(users.records[0]._fields[0].properties.name);
                thread.save();
                session.close();
                res.status(200).send({ Message:'Downvoted thread.' });
              }
	          }).catch(next);
      	}
    	}).catch(next);
  }
};