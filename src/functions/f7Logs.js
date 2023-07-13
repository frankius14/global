const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const f7Logs = (report, server) => {
    
    return new Promise((resolve, reject) => {

        if(!report) {
            reject("Error while receiving details...");
        }

        try {
            db.all("SELECT * from player_info where steam_id = '"+ report.TargetId +"';", async function(err, table) {
                if(err) reject(err);
                if(table[0].length < 1) return;
                if(server.SERVER_LOGGING.F7_REPORT_LOGGING.ENABLED) {
                    db.all("SELECT * from player_info where steam_id = '"+ report.PlayerId +"';", async function(err, table2) {
                        if(err) reject(err)
                    if(table2[0].ignore_f7_from) resolve("Done");
                    if(table[0].ignore_f7_against) resolve("Done");
                    const f7URL = new Discord.WebhookClient({ url: server.SERVER_LOGGING.F7_REPORT_LOGGING.LOG_WEBHOOK });

                    let reason = report.Subject.split(" ");
                    reason = reason[0];
                    const embed = new Discord.EmbedBuilder()
                        .setAuthor({ name: `PLAYER REPORT`})
                        .setColor(server.SERVER_LOGGING.F7_REPORT_LOGGING.EMBED_COLOR)
                        .setTimestamp()
                        .setFooter({ text: "Reported" })
    
                    embed.setDescription(`**[${report.PlayerName}](https://steamcommunity.com/profiles/${report.PlayerId})** reported **[${report.TargetName}](https://steamcommunity.com/profiles/${report.TargetId})** for **${reason}**\n\n**Reporter:** [${report.PlayerName}](https://steamcommunity.com/profiles/${report.PlayerId}) - [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${report.PlayerId})\n**Reported:** [${report.TargetName}](https://steamcommunity.com/profiles/${report.TargetId}) - [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${report.TargetId}) - ${parseInt(table[0].report_count) + 1} total reports\n**Reason:** ${report.Subject}\n**Note:** ${report.Message}`)    
                    f7URL.send({ embeds: [embed] });
                })

                }

                db.all("update player_info set report_count = '"+ (parseInt(table[0].report_count) + 1) +"' where steam_id = '"+ report.TargetId +"';", async function(err, table) {
                    if(err) reject(err);
                });

            });
        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = f7Logs;
