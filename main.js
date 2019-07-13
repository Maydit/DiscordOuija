const Discord = require('discord.io');
const auth = require('./auth.json');

/*
Add bot:
https://discordapp.com/oauth2/authorize?&client_id=555173602006138890&scope=bot&permissions=67648
*/

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
        return; //no infinite loops
    }
    //user wants help: print useage and options
    if(message.indexOf("!ouijabot") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Ouijabot will automatically regulate a 'ouija' channel and post the resulting sentences in a 'wordofouija' channel."
        });
        return;
    } 
});