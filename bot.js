const Discord = require('discord.io');

/*
Add bot:
https://discordapp.com/oauth2/authorize?&client_id=600467162485751819&scope=bot&permissions=130112
*/

const punctuation = ['.', '!', '?'];
const contpunct = [',', '"', "'", ')', '}', ']'];
const ouijachannels = ["599311652785225760"];
const pinnedMsgLimit = 40;

var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);

let lastpunctID = 0;

console.log("test");

const bot = new Discord.Client({
    autorun: true,
    token: process.env.BOT_TOKEN
});

bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.setPresence({
    game: {
        name: "!ouijabot"
    }
});

bot.on('message', async function(user, userID, channelID, message, evt) {
    //console.log(channelID);
    if(userID == bot.id) {
        if(ouijachannels.includes(channelID)) {
            bot.pinMessage({
                channelID: channelID,
                messageID: evt.d.id,
            });
            addAllReactions(['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'], channelID, evt.d.id);
            lastpunctID = evt.d.id;
            if(message.length == 0) {
                bot.deleteMessage({
                    channelID: channelID,
                    messageID: evt.d.id,
                });
            }
        }
        //console.log("Bot posted in channel!, %s, %s", message, message.length);
        return;
    }
    if(ouijachannels.includes(channelID)) {
        //console.log("read a message in a ouija channel: %s", message);
        if(lastpunctID == 0) {
            lastpunctID = evt.d.id;
        }
        //links
        if(message.match(regex)) {
            //console.log("matched link regex");
            bot.deleteMessage({
                channelID: channelID,
                messageID: evt.d.id,
            });
            return;
        }
        //
        let resp = validate(userID, message);
        if(resp === 0) { //punctated
            //console.log("message was punctuation. printing full message:");
            //if punctuation we post a message in the ouija channel with a pin
            //get history
            bot.getMessages({
                channelID: channelID,
                before: evt.d.id,
                after: lastpunctID,
                limit: 100 
            }, function(err, response) {
                let messagearray = [];
                for (var i in response.reverse()) {
                    messagearray.push(response[i]['content']);
                }
                //construct message
                sentence = construct(messagearray);
                //console.log(sentence);
                //post
                bot.sendMessage({
                    to: channelID,
                    message: sentence
                });
            });
            return;
        } else if(resp === -1) { //invalid
            //console.log("invalid message, deleted");
            //delete message
            bot.deleteMessage({
                channelID: channelID,
                messageID: evt.d.id,
            });
            return;
        } else {
            return;
        }
    }
    //user wants help: print useage and options
    if(message.indexOf("!ouijabot") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Ouijabot will automatically regulate the 'ouija' channel and post the resulting sentences."
        });
        return;
    }
    if(message.indexOf("!ouijaversion") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Latest change: added version checking."
        });
        return;
    }
});

let prevuser = 0;
function validate(user, message) {
    //no spaces (if no punct)
    //no doubleposting
    if(user == prevuser) { //doubleposting
        return -1;
    }
    prevuser = user;
    const spaceloc = message.indexOf(' ');
    if(spaceloc != -1) { //no spaces
        return validsoftpunc(message, contpunct);
    }
    let punctstat = onlycontains(message, punctuation);
    //console.log("does it contain punctuation?: %s", punctstat);
    if(punctstat === 1) {
        return 0;
    } else if(punctstat === -1) {
        return -1;
    }
}

function validsoftpunc(message, array) {
    let curr = -1;
    let flag = true;
    while(curr < message.length - 1) {
        curr++;
        if(flag) {
            if(array.includes(message[curr])) {
                continue;
            }
            if(message[curr] == ' ') {
                flag = false;
                continue;
            }
            return -1;
        } else {
            if(array.includes(message[curr])) {
                return -1;
            }
            if(message[curr] == ' ') {
                return -1;
            }
        }
    }
}

function onlycontains(message, array) {
    let curr = -1;
    let flag;
    while(curr < message.length - 1) {
        curr++;
        if(curr == 0) {
            flag = array.includes(message[curr]);
        }
        if(flag != array.includes(message[curr])) {
            return -1;
        }
    }
    return Number(flag);
}

function construct(arr) {
    let sent = "";
    for (j in arr) {
        i = arr[j];
        if(onlycontains(i, punctuation) == 1) {
            sent = sent + i;
        } else if(i.indexOf(' ') != -1) {
            sent = sent + i;
        } else {
            sent = sent + " " + i;
        }
    }
    return sent;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAllReactions(reactions, cID, mID) {
    for(let i = 0; i < reactions.length; ++i) {
        //console.log(`Attempting to add reaction: ${reactions[i]}`);
        bot.addReaction({
            channelID: cID,
            messageID: mID,
            reaction: reactions[i]
        });
        if(i !== reactions.length - 1) await sleep(1000);
    }
}