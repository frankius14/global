const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const chalk = require('chalk');

const botStatus = (message, server, servers, index) => {
    
    return new Promise((resolve, reject) => {

        if(!message) {
            reject("Error while receiving details...");
        }

        try {
            const playersOnline = message.content.Players;
            const maxPlayers = message.content.MaxPlayers;
            const queuedPlayers = message.content.Queued;
            const joiningPlayers = message.content.Joining;
            const wipedAt = message.content.SaveCreatedTime;
            let threshold = "";
            let wipedToday = '';
            
            let wipedTodaySettings = server.USE_POP_AS_A_BOT_STATUS.OPTIONS.WIPED_TODAY;
            let didntWipeTodaySettings = server.USE_POP_AS_A_BOT_STATUS.OPTIONS.DIDNT_WIPE_TODAY;

            if (Date.parse(wipedAt + 'Z') + (wipedTodaySettings.MAX_HOURS_SINCE_LAST_WIPE * 3600000) > Date.now()) {
              wipedToday = true;
            } else {
              wipedToday = false;
            }
            if(wipedTodaySettings.ENABLED && wipedToday) {
              if(wipedTodaySettings.ENABLED && wipedTodaySettings.WIPED_TODAY_STATUS.ENABLE_THRESHOLD_MESSAGE) threshold = maxPlayers * `0.${wipedTodaySettings.WIPED_TODAY_STATUS.THRESHOLD_PERCENT}`;

              if(wipedTodaySettings.WIPED_TODAY_STATUS.ENABLE_THRESHOLD_MESSAGE && playersOnline < threshold) {
                console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 👉 [ ${chalk.cyan(server.SERVER_SHORTNAME)} ] status: ${chalk.cyan(wipedTodaySettings.WIPED_TODAY_STATUS.THRESHOLD_MESSAGE)}`);
                resolve({ activities: [{ name: `${wipedTodaySettings.WIPED_TODAY_STATUS.THRESHOLD_MESSAGE}`, type: Discord.ActivityType.Watching }], status: "online" });
            } else if(queuedPlayers > 0) {
                getPopMessage(wipedTodaySettings.WIPED_TODAY_STATUS.PLAYERS_QUEUED_MESSAGE);
              } else if(joiningPlayers > 0) {
                getPopMessage(wipedTodaySettings.WIPED_TODAY_STATUS.PLAYERS_JOINING_MESSAGE);
              } else {
                getPopMessage(wipedTodaySettings.WIPED_TODAY_STATUS.PLAYER_COUNT_MESSAGE);
              }

            } else {

              if(didntWipeTodaySettings.ENABLE_THRESHOLD_MESSAGE) threshold = maxPlayers * `0.${didntWipeTodaySettings.THRESHOLD_PERCENT}`;

              if(didntWipeTodaySettings.ENABLE_THRESHOLD_MESSAGE && playersOnline < threshold) {
                resolve({ activities: [{ name: `${didntWipeTodaySettings.THRESHOLD_MESSAGE}`, type: Discord.ActivityType.Watching }], status: "online" });
                console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 👉 [ ${chalk.cyan(server.SERVER_SHORTNAME)} ] status: ${chalk.cyan(didntWipeTodaySettings.THRESHOLD_MESSAGE)}`);
              } else if(queuedPlayers > 0) {
                getPopMessage(didntWipeTodaySettings.PLAYERS_QUEUED_MESSAGE);
              } else if(joiningPlayers > 0) {
                getPopMessage(didntWipeTodaySettings.PLAYERS_JOINING_MESSAGE);
              } else {
                getPopMessage(didntWipeTodaySettings.PLAYER_COUNT_MESSAGE);
              }

            }

            function getPopMessage(popMessage) {
                popMessage = popMessage.replace(/{playersOnline}/gi, playersOnline)
                popMessage = popMessage.replace(/{maxPlayers}/gi, maxPlayers);
                popMessage = popMessage.replace(/{joiningPlayers}/gi, joiningPlayers);
                popMessage = popMessage.replace(/{queuedPlayers}/gi, queuedPlayers);
                
                console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 👉 [ ${chalk.cyan(server.SERVER_SHORTNAME)} ] status: ${chalk.cyan(popMessage)}`);
                resolve({ activities: [{ name: `${popMessage}`, type: Discord.ActivityType.Watching }], status: "online" });
            }
            
        } catch(err) {
            reject("Rejected")
            console.log(err)
        }
    });
 
}



module.exports = botStatus;
