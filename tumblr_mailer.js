var fs = require('fs');
var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
var ejs = require('ejs');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('g6fD-zKehBgKkKODwJ3Jng');

// Authenticate via OAuth
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'SoZ60McgdWzfwC0diBZbpNiSKEAe7kVOd4b9BM4L7UxTfjdZQm',
  consumer_secret: 'xkD3Q4K1MJ5jG3wPTutlt6AvI0AYc5xU1nnjgRtBlXvhfkhJWQ',
  token: 'Gqse8iteXPcViOeBTrfug35YwAQxRj37kFO35PgsrjYX3ZuTlL',
  token_secret: 'b2YksdGPBsAO0PYaYggOjsvII2NquNpbuOEsUnS1ZSfGagTeDk'
});



// Parse the CSV File
// First row will be headers, so can't include it
// Will return an 'array' of 'objects', with 4 keys for each object
//firstname, lastname, nummonths since contact, email address


function csvParse(csvFile){
    var arrayOfObjects = [];
    var arr = csvFile.split("\n");
    var newObj;

    keys = arr.shift().split(",");
    arr.forEach(function(contact){
        contact = contact.split(",");
        newObj = {};
        for(var i =0; i < contact.length; i++){
            newObj[keys[i]] = contact[i];
        }
        arrayOfObjects.push(newObj);
    })
    return arrayOfObjects;
}


client.posts('alert-code-mike.tumblr.com', function(err, blog){
	// Accessing the posts data to access the latest posts.
	// Convert all time to milliseconds, and then divide by the number of milliseconds
	// in a day to return an array of posts that are less than or equal to 7 days old (using filter)
		var latestPosts = blog.posts.filter(function(post) {
		var dayinMill = 24 * 60 * 60 * 1000;
		var postDate = new Date(post.date).getTime();
		var dateNow = new Date().getTime();
		return ((dateNow - postDate)/dayinMill) <= 7;
	});

//Parse read-in data to produce an array of objects
  csvData = csvParse(csvFile);
			csvData.forEach(function(row){
			firstName = row['firstName'];
			numMonthsSinceContact = row['numMonthsSinceContact'];
			email = row["emailAddress"];
			copyTemplate = emailTemplate;

			var customizedTemplate = ejs.render(copyTemplate, {firstName: firstName,
									   numMonthsSinceContact: numMonthsSinceContact,
									   latestPosts: latestPosts
			 });
			sendEmail(firstName, email, "Michael", "chunghanliou@gmail.com", "testing", customizedTemplate);
		});
});


    function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }