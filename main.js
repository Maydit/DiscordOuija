const Discord = require('discord.io');
const auth = require('./auth.json');

/*
Add bot:
https://discordapp.com/oauth2/authorize?&client_id=555173602006138890&scope=bot&permissions=67648
*/

const punctuation = ['.', '!', '?'];
const contpunct = [',', '"', "'", ')', '}', ']'];

const bot = new Discord.Client({
    autorun: true,
    token: auth.token,
});

bot.setPresence({
    game: {
        name: "!ouijabot"
    }
});

bot.on('ready', function(event) {
    //console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', async function(user, userID, channelID, message, evt) {
    if(user.bot == true) {
        if(channelID === 599311652785225760) {
            bot.pinMessage({
                channelID: channelID,
                messageID: evt.d.id,
            });
        }
        return;
    }
    //user wants help: print useage and options
    if(message.indexOf("!ouijabot") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Ouijabot will automatically regulate a 'ouija' channel and post the resulting sentences in a 'wordofouija' channel."
        });
        return;
    }
    if(channelID === 599311652785225760) {
        let resp = validate(userID, message);
        if(resp === 0) { //punctated
            //if punctuation we post a message in the ouija channel with a pin
            //get history
            let messagearray = [];
            bot.getMessages({
                channelID: 599311652785225760,
                before: evt.d.id,
                after: lastpunctID,
                limit: 100 
            }, err, messagearray);
            messagearray.push(message);
            lastpunctID = evt.d.id;
            //construct message
            sentence = messagearray.join(' ');
            //post
            bot.sendMessage({
                to: channelID,
                message: sentence,
                typing: true
            });
            return;
        } else if(resp === -1) { //invalid
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
});

let prevuser = 0;
function validate(user, message) {
    //no spaces (if no punct)
    //no doubleposting
    //no editing unless most recent
    //three thumbs down on most recent -> deletes
    if(user == prevuser) { //doubleposting
        return -1;
    }
    prevuser = user;
    const spaceloc = message.indexOf(' ')
    if(spaceloc != -1) { //no spaces
        //check punctuation
        softpuncloc = containslocation(message, contpunct);
        if(softpuncloc > spaceloc) {
            //invalid
            return -1;
        }
    }
    if(containslocation(message, punctuation) != -1) {
        return 0;
    }
}

function containslocation(message, array) {
    let res = -1;
    let len = array.len;
    while(len--) {
        res = message.indexOf(array[len]);
        if(res != -1) {
            break;
        }
    }
    return res;
}