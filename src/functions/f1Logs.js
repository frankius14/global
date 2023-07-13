const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const f1Logs = (MsgContent, server) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }

        try {

            const logURL = new Discord.WebhookClient({ url: server.SERVER_LOGGING.F1_SPAWN_ITEM_LOGS.LOG_WEBHOOK })
                const embed = new Discord.EmbedBuilder()
                      .setAuthor({ name: `F1 Item spawned`})
                      .setDescription(`${MsgContent}`)
                      .setColor(server.SERVER_LOGGING.F1_SPAWN_ITEM_LOGS.EMBED_COLOR)
                      .setTimestamp()
                      .setFooter({ text: "Spawned" })
                logURL.send({ embeds: [embed] })  

            resolve("Done");

        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = f1Logs;
