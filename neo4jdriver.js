const neo4j = require('neo4j-driver').v1;

let driver;

driver = neo4j.driver('bolt://hobby-aidhmkniipmbgbkebidkggcl.dbs.graphenedb.com:24786',
	neo4j.auth.basic('studdit-admin', 'b.g7uEff35y11n.OduI70y5dJbqvmxV'));

module.exports = driver;