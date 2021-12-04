var request = require("request");
var fs = require("fs");

// This is your API token
var TOKEN = "dca3c5101b6247df90d01ce907bcf7f2"

// This method is going to be used to send all the requests
function make_request(method, url, data, files = {}, callback){
    var data = JSON.parse(JSON.stringify(data))
    for (var i of Object.keys(files))
        data[i] = fs.createReadStream(files[i])

    request({
        method: method,
            url: url,
            headers: {
                    'token': TOKEN
            },
            formData: data
    }, function (error, response, body) {
    if (error) throw new Error(error);

    if (callback != undefined)
        callback(JSON.parse(body))
    });
}

	
	console.log("Creating person for Brad Pitt")
	make_request("POST", "https://api.luxand.cloud/subject", {name: "Sergey"}, {}, function(response){

	// You can also upload file from local storage instead of using URL
	// make_request("POST", "https://api.luxand.cloud/subject/" + response.id, {}, {photo: "/path/to/image.jpg"}, function(body){
	make_request("POST", "https://api.luxand.cloud/subject/" + response.id, {}, {photo: "1.png"}, function(body){
	console.log(response.id);
    console.log("Verifying Brad Pitt in this photo https://dashboard.luxand.cloud/img/angelina-and-brad.jpg")
		
		// You can also upload file from local storage instead of using URL
		// make_request("POST", "https://api.luxand.cloud/photo/verify/" + response.id, {}, {"photo": "/path/to/image.jpg"}, function(body){
		make_request("POST", "https://api.luxand.cloud/photo/verify/" + response.id, {}, {"photo": "2.png"}, function(body){
                	console.log(body)
       		})
	})
})
