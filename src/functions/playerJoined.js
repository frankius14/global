const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const steamAccount = require('./steamAccount');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});
const config = require('../../config.json');

const playerJoined = (steamID, server) => {
    
    return new Promise(async (resolve, reject) => {

        if(!steamID) {
            reject("Error while receiving details...");
        }

        try {
            let account = await steamAccount(steamID);
            db.all("SELECT * from player_info where steam_id = '"+ steamID +"' and server_id = '"+server.SERVER_SPECIAL_ID+"';", async function(err, table) {
                if(err) reject(err);
                if(table.length > 0) {
                    if(config.PLAYER_PROFILER.WATCHLIST.ENABLED && table[0].watchlist) {
                        console.log("Reading")
                        const hook = new Discord.WebhookClient({ url: config.PLAYER_PROFILER.WATCHLIST.ALERT_WEBHOOK });
                        const roles = [];
                        for(let role of config.PLAYER_PROFILER.WATCHLIST.ALERT_ROLES) {
                            if(!role.toLowerCase().includes("role_id")) roles.push(`<@&${role}>`)
                        }
                        const embed = new Discord.EmbedBuilder()
                        .setAuthor({ name: `${account.personaname} | WATCHLIST ALERT`, iconURL: account.avatarfull, url: account.profileurl })
                        .setDescription(`**User:** [${account.personaname}](${account.profileurl})\n**SteamID:** [${account.steamid}](${account.profileurl}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${account.steamid})`)
                        .setTimestamp()
                        .setFooter({ text: "Joined" })
                        .setColor("#f56642")
                        .setThumbnail(account.avatarfull)
                        hook.send({ content: roles.join(", "), embeds: [embed] });
                    }
                    let newConnections = parseInt(table[0].connections) + 1;
                    db.all("update player_info set connections = '"+ newConnections +"' where steam_id = '"+ steamID +"' and server_id = '"+server.SERVER_SPECIAL_ID+"';", async function(err, table) {
                        if(err) reject(err);
                        resolve("Success");
                    })
                }
            });

            if(server.SERVER_LOGGING.SERVER_JOIN_LOGS.ENABLED) {
                const hook = new Discord.WebhookClient({ url: server.SERVER_LOGGING.SERVER_JOIN_LOGS.LOG_WEBHOOK });
                const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: `${account.personaname} has joined!`, iconURL: account.avatarfull, url: account.profileurl })
                .setDescription(`**User:** [${account.personaname}](${account.profileurl})\n**SteamID:** [${account.steamid}](${account.profileurl}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${account.steamid})`)
                .setTimestamp()
                .setFooter({ text: "Joined" })
                .setColor(server.SERVER_LOGGING.SERVER_JOIN_LOGS.EMBED_COLOR)
                .setThumbnail(account.avatarfull)
              
              hook.send({ embeds: [embed] });
            }

        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = playerJoined;
