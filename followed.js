var CID = 'replace this with client id';
var secret = 'replace this with secret';
//GET A CID AND SECRET BY REGISTERING AN APPLICATION AT https://dev.twitch.tv/console/apps


function getAuth(CID, secret){ //Asks the Twitch API for an oauth token using the client id (CID) and the secret.
    $.ajax({
        type: 'POST',
        url: "https://id.twitch.tv/oauth2/token?client_id="+CID+"&client_secret="+secret+"&grant_type=client_credentials",
        success: function(data) {
            auth = data["access_token"];
        },
        error: function(data){
            info = document.getElementById("info")
            info.innerHTML = "ERROR: " + data["responseJSON"]["message"] + ". Make sure your CID and corresponding secret are set in the JavaScript."
        } 
    })
}

getAuth(CID, secret);
function printFollows(json, type){ //Puts the data received from the Twitch API into a readable table.
    let totalfollowed = json["total"]
    body = document.getElementById("body")
    total = document.getElementById("total")
    if (counter>100){
        total.innerHTML = "Total followed: " + totalfollowed + " | left to load: " + (counter);
    } else {
        total.innerHTML = "Total followed: " + totalfollowed
    }
    body.appendChild(total)
    table = document.getElementById("table")
    body.appendChild(table)
    for (i=0;i < json["data"].length;i++){
        newtd = document.createElement("td")
        newtr = document.createElement("tr")
        newtd.appendChild(newtr)
        if (type){
            newtd = document.createElement("td")
            newtd.innerHTML = json["data"][i]["from_name"]
            newtr.appendChild(newtd)
        } else {
            newtd = document.createElement("td")
            newtd.innerHTML = json["data"][i]["to_name"]
            newtr.appendChild(newtd)
        }
        newtd = document.createElement("td")
        newtd.innerHTML = json["data"][i]["followed_at"]
        newtr.appendChild(newtd)
        table.appendChild(newtr)
    }
}

function getFollows(id, after=null, direction){ //Gets follower list from the Twitch API. 
    //Direction argument specifies whether it asks the API for the channels the specified user follows or the channels who follow the user.
    //Twitch API returns up to 100 results in one response. If the user is following or is followed by more than 100 users, this function is called again to get the rest of the results.
    if (after){ //If 'after' is specified in the arguments, the function will get the next set of results.
        newurl = 'https://api.twitch.tv/helix/users/follows?after='+after+'&first=100&'+direction+'_id='+id 
    } 
    else {
        newurl = 'https://api.twitch.tv/helix/users/follows?first=100&'+direction+'_id='+id
    }
    $.ajax({
        type: 'GET',
        url: newurl,
        headers: {
            "Client-ID": CID,
            "Authorization": "Bearer "+auth
        },
        success: function(data) {
            printFollows(data)
            if (counter == null){ //First time this function is called the counter is updated with the total amount of follows to get.
                counter = data["total"]   
            }
            if (counter >= 100){ //If there are more than 100 results left to load, calls this function again (recursively) with updated 'after' argument.
                counter = counter - 100
                getFollows(id,data["pagination"]["cursor"], direction)
            } 
        }
    });
}

function getUserid(username){ //Gets the userid of the user that was specified. This is because the API requires a UID for the queries instead of the username.
    table = document.getElementById("table").innerHTML= "" //Clears the table and counter for new results.
    counter = null
    newurl = 'https://api.twitch.tv/helix/users?login='+username
    $.ajax({
        type: 'GET',
        url: newurl,
        headers: {
            "Client-ID": CID,
            "Authorization": "Bearer "+auth
        },
        success: function(data) { //If the userid query was successful it will proceed to print the followerlist and also some data about the user that was sent from Twitch alongside the UID.
            if (data["data"].length>0){
                document.getElementById("uid").innerHTML=data["data"][0]["display_name"]+" | User ID: " + data["data"][0]["id"] + 
                " | Viewcount: "+data["data"][0]["view_count"]+ " | Description: " + data["data"][0]["description"] +"<br>";
                radio = document.getElementById("follow")
                if (radio.checked){ //Specifies the direction.
                    getFollows(data["data"][0]["id"], null, "from")
                } else {
                    getFollows(data["data"][0]["id"], null, "to")
                }
            } else {
                document.getElementById("uid").innerHTML="User does not exist.";
            }
        }
    });
}

var input = document.getElementById("uname");

input.addEventListener("keyup", function(event) { //This function enables the use of the enter key as an alternative for clicking the submit button.
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("submitbtn").click();
    }
  });
