
/** Function not in use - this is done by cactus comments
 * function to create comment rooms for ideas
 * @param {number} IdeaID - IdeaID for which a room should be created
 * @param {string} [forCreation] - Display name of room, if not provided room will be namend 'comments for Idea #IdeaID' 
 * @returns {Room} - room object
 */
function createRoom(IdeaID, roomName){
    if(!openideaClient) loginOpenIdea();
    roomName = roomName || 'comments for Idea #' + IdeaID;
    var options = {
        name: roomName,
        room_alias_name: RoomAlias(IdeaID, true),
        visibility: "public"
    };

    console.log(options);

    return openideaClient.createRoom(options);
}


//TODO
/**
 * function to fetch (num) last messages of room 
 * @param {number} IdeaID - IdeaID to fetch messages from
 * @param {number} num - number of fetched messages
 * @returns {(string|string[])} - returns num messages of matrix room asocciated with IdeaID
 */
async function getLastMessages(IdeaID, num){
    if(!openideaClient) loginOpenIdea();

    await openideaClient.startClient({initialSyncLimit: 10});
// await openideaClient.once('sync', function(state, prevState, res) {
//     if(state === 'PREPARED') {
//         console.log("prepared");
//     } else {
//         console.log(state);
//         process.exit(1);
//     }
// });

var roomID = await openideaClient.joinRoom(RoomAlias(IdeaID));
// try{
// var room = await openideaClient.getRoom(roomID.roomId);
// } catch (e) {console.log(e);}

var iTest = 0;

await openideaClient.on("Room.timeline", function(event, room, toStartOfTimeline) {
  if (event.getType() !== "m.room.message") {
    return; // only use messages
  }
  //if(room.name == RoomAlias(IdeaID)) console.log(room);
  if(room.roomId == roomID.roomId) console.log("finaly");
  console.log(iTest++);
  console.log(room.roomId);
  console.log(event.event.content.body);
});

// var scrollback = await   openideaClient.scrollback(roomID);
// Object.keys(openideaClient.store.rooms).forEach((roomId) => {
//   client.getRoom(roomId).timeline.forEach(t => {
//       console.log(t.event);
//   });
// });

    let messages; 
        //join room (even if joined already returns the roomID which is needed to write to it)
        // var roomID = await openideaClient.joinRoom(RoomAlias(IdeaID));
        // try{
        //     openideaClient.getRoom(roomID.roomId).timeline.forEach(t => {
        //         console.log(t.event);
        //         });
            
        // //     messages = openideaClient.scrollback(roomID.roomId, num);
        // // console.log(messages);
        // } catch (e) {console.log(e);}

    return messages;
}

/**
 * function to create consistant roomAliases
 * @param {number} IdeaID - IdeaID which needs a room
 * @param {boolean} [forCreation=false] - if true switches to only local part as return (like Idea_IdeaID)
 * @returns {string} - roomAlias looks like this: #Idea_IdeaID:dohm.work
 */
function RoomAlias(IdeaID, forCreation=false){
    var roomAlias = 'Idea_' + IdeaID;
    if(!forCreation) roomAlias = '#' + roomAlias + ':' + matrixGroupUrl;
    return roomAlias;
}

/**
 * function to send usermessage to idea room
 * @param {string} user - user which sends the message
 * @param {number} IdeaID - number of idea hosting the room
 * @param {string} message - usermessage
 * @param {*} db - opened sqlite database to fetch users matrix data from 
 * @returns {string} - errormessage or undefined at success
 */
async function sendMessage(user, IdeaID, message, db) {
    //get matrixname and matrixpw from database (db)
    let matrix = await getMatrixUserByName(user, db);
    console.log(matrix);
    if(matrix == null || !matrix.matrixname || !matrix.matrixpw) return 'username not found';
    //matrix login
    const client = sdk.createClient(matrixServer);
    await client
        .login("m.login.password", {
            user: matrix.matrixname,
            password: matrix.matrixpw,
        })
        .then((response) => {
            // console.log(response.access_token);
        });
    await client.startClient();

    //join room (even if joined already returns the roomID which is needed to write to it)
    var roomID
    try {
        roomID = await client.joinRoom(RoomAlias(IdeaID));
        roomID = roomID.roomId;
    } catch (e) {
        if(e.errcode == 'M_NOT_FOUND') 
        {
            try {
                await createRoom(IdeaID);
                roomID = await client.joinRoom(RoomAlias(IdeaID));
                roomID = roomID.roomId;
            }
            catch (e) {return "room coudn't be joined or created"}
        }
    }
    try {
        //create content for message to be send
        var content = {
            body: message,
            msgtype: "m.text",
        };
        //matrix send message to room
        client
            .sendEvent(roomID, "m.room.message", content, "")
            .then((res) => {
                // message sent successfully
                return;
            })
            .catch((err) => {
                console.log(err);
                return err;
            });
    }
    catch (e) {
        return e;
    }
};