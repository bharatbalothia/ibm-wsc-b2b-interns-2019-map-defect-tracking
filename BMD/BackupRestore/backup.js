var fs = require('fs'),
nano = require('nano')('http://localhost:5984'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform')
escalationform = nano.db.use('escalationform'),
invalidforms = nano.db.use('invalidforms'),
fusers = nano.db.use('forbiddenusers'),
accountmerge = nano.db.use('accountmerge'),
transactions = nano.db.use('transactions');

var getdb = function(callback) {
	var dbname = process.argv[2];
	var filename = process.argv[3];

      if(dbname=='nonticketform') {
        return callback(filename, nonticketform, dbname);
      }
      else if(dbname=='ticketform') {
        return callback(filename, ticketform, dbname);
      }
      else if(dbname=='escalationform') {
        return callback(filename, escalationform, dbname);
      }
      else if(dbname=='invalidforms') {
        return callback(filename, invalidforms, dbname);
      }
      else if(dbname=='fusers') {
        return callback(filename, fusers, dbname);
      }
      else if(dbname=='accountmerge') {
        return callback(filename, accountmerge, dbname);
      }
      else if(dbname=='transactions') {
        return callback(filename, transactions, dbname);
      }
      else {
        console.log("Looks like invalid file!")
      }
}

var main = function() {
	getdb(function(filename, db, dbname) {
		db.list({include_docs: true}, function(err, result) {
			if(err) {
				console.log(err);
			}
			else {
				result.dbname = dbname;
				data = JSON.stringify(result);
				fs.writeFile(filename, data, function(err) {
					if(err) {
						console.log(err)
					}
					else {
						console.log("success")
					}
				})
			}
		})
	})
}

main();