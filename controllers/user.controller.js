const driver = require('../neo4jdriver');

module.exports = {

	//Add a new user.
	create(req, res, next) {
		const username = req.body.username;
		const password = req.body.password;

		let session = driver.session();

		session.run(
			`MATCH (u:User)
			WHERE u.name = $name
			RETURN u`,
			{ name: username } 
		).then((result) => {
			if (result.records.length > 0) { //Check if user already exists in db
				res.send({ Message: 'User already exists.' });
			} else {
				session.run( //Create new user
					`CREATE (user:User { name: $name, password: $password })
					RETURN user`,
					{ name: username, password: password }
				).then((result) => {
					session.close();
					res.send({ Message: 'User ' + username + ' has been successfully created.'});
				}).catch(next);
			}
		}).catch(next);
	},

	//Change the password for a user.
	update(req, res, next) {
		const username = req.body.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    let session = driver.session();

    session.run( //Find the user
      `MATCH (u:User)
      WHERE u.name = $name
      RETURN u`,
      { name: username }
    ).then((result) => {
      if (result.records < 1) { //Check if user exists
        session.close();
        res.status(400).send({ Message: "User not found." });
      } else {
        if (result.records[0]._fields[0].properties.password === oldPassword) { //Check if password is correct
          session.run(
            `MATCH (n { name: $name })
	          SET n.password = $password
	          RETURN n`,
              { name: username, password: newPassword }
          ).then(() => {
            session.close();
            res.status(200).send({ Message: "Password has been successfully changed." });
          }).catch(next);
        } else {
          session.close();
          res.status(401).send({ Message: "Current password does not match." });
        }
      }
    }).catch(next);
	},

	//Delete user from db
	delete(req, res, next) {
		const username = req.body.username;
    const password = req.body.password;

    let session = driver.session();

    session.run( //First find the user
      `MATCH (u:User)
      WHERE u.name = $name
      RETURN u`,
      { name: username }
    ).then((result) => {
      if (result.records.length > 0) { //Check if user exists
        if (result.records[0]._fields[0].properties.password === password) { //Check if passwords match
          session.run( //Remove friends before removing the user
            `MATCH (:User {name: $name})-[r:HAS_FRIEND]-(:User) 
            DELETE r`,
            { name: username }
          ).then(() => {
            session.run( //remove the user
              `MATCH (a:User {name: $name})
             	DELETE a`,
              { name: username }
            ).then(() => {
              session.close();
              res.status(200).send({ Message: "User has been deleted." });
            }).catch(next);
          }).catch(next);
        } else {
          session.close();
          res.status(401).send({ Message: "Password does not match." });
        }
      } else {
        session.close();
        res.status(400).send({ Message: "User not found." });
      }
    }).catch(next);
	},

 //Add friendship between two users
	addFriend(req, res, next) {
		const user1 = req.body.username1;
    const user2 = req.body.username2;

    let session = driver.session();

    session.run( //Check if both users exist in the DB
	    `MATCH (x:User)
	    WHERE x.name= $name1 OR x.name= $name2
	    RETURN x`,
	    { name1: user1, name2: user2 }
    ).then((result) => {
      if (result.records.length !== 2) {
      	res.status(422).send({ Error: "One or both users do not exist." })
      } else {
        session.run( //Check if users are already friends
          `MATCH p = (x:User)-[r:HAS_FRIEND]-(y:User)
          WHERE x.name= $name1 AND y.name= $name2 
          RETURN p`,
          { name1: user1, name2: user2 }
        ).then((result) => {
          if (result.records.length < 1) {
            session.run( //Save friendship in DB
              `MATCH (a:User {name: $name1}), (b:User{name: $name2})
              CREATE (a)-[:HAS_FRIEND]->(b)`,
              { name1: user1, name2: user2 }
            ).then(() => {
              session.close();
              res.status(200).send({ Message: 'Friendship has been added.' });
            }).catch(next);
          } else {
            res.status(200).send({ Message: 'Users are already friends.' });
          }
        }).catch(next);
      }
    }).catch(next);
	},

	deleteFriend(req, res, next) {
		const user1 = req.body.username1;
    const user2 = req.body.username2;

    let session = driver.session();

    session.run( //Check if both users exist in the DB
      `MATCH (x:User)
      WHERE x.name= $name1 OR x.name = $name2
      RETURN x`,
      { name1: user1, name2: user2 }
    ).then((result) => {
      if (result.records.length !== 2) {
        session.close()
        res.status(422).send({ Error: "One or both users do not exist." })
      } else {
        session.run( //Check if users are already friends
          `MATCH p = (x:User)-[r:HAS_FRIEND]->(y:User)
          WHERE x.name= $name1 AND y.name= $name2 
          RETURN p`,
          { name1: user1, name2: user2 }
        ).then((result) => {
          if (result.records.length > 0) {
            session.run( //Remove friendship in DB
              `MATCH (:User {name: $name1})-[r:HAS_FRIEND]-(:User {name: $name2}) 
              DELETE r`,
              { name1: user1, name2: user2 }
            ).then(() => {
              session.close();
              res.status(200).send({ Message: 'Friendship has been removed.' });
            }).catch(next);
          } else {
            session.close();
            res.status(200).send({ Message: 'No friendship found between users.' });
          }
        }).catch(next);
      }
    }).catch(next);
  }
};