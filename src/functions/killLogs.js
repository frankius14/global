const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const killLogs = (theValue, killArray, server) => {
    
    return new Promise((resolve, reject) => {

        if(!killArray) {
            reject("Error while receiving details...");
        }

        try {
            const hook = new Discord.WebhookClient({ url: server.SERVER_LOGGING.KILL_LOGS.LOG_WEBHOOK });
            const embed = new Discord.EmbedBuilder()
            if(theValue) {
                embed.setDescription(`${killArray[1]} ( ${killArray[2]} / [${killArray[3]}](https://steamcommunity.com/profiles/${killArray[3]}/) ) has been killed by  ${killArray[5]} ( ${killArray[6]} / [${killArray[7]}](https://steamcommunity.com/profiles/${killArray[7]}/) )`)
            } else {
                if(killArray.includes("at (")) {
                    killArray = killArray.split("at (");
                    killArray = killArray[0];
                }
                embed.setDescription(`${killArray}`)
            }


            hook.send({ embeds: [embed] })
            resolve("Done")
        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = killLogs;
