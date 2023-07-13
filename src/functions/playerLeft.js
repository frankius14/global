const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const steamAccount = require('./steamAccount');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});
const config = require('../../config.json');

const playerLeft = (messageContent, server) => {
    
    return new Promise(async (resolve, reject) => {

        if(!messageContent) {
            reject("Error while receiving details...");
        }

        try {
          let re = /7656119([0-9]{10})/gm;
            let results = messageContent.match(re);
            if(results !== null) {
              if(server.SERVER_LOGGING.SERVER_LEAVE_LOGS.ENABLED) {

                let hook = new Discord.WebhookClient({ url: server.SERVER_LOGGING.SERVER_LEAVE_LOGS.LOG_WEBHOOK });
                        
                fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${results[0]}`).then(res => res.text()).then(steam => {
                try {
                  steam = JSON.parse(steam);  
                    if(!steam.response.players[0]) {
                      return;
                    }

                  const { personaname, avatarfull, profileurl, steamid } = steam.response.players[0];

                  const embed = new Discord.EmbedBuilder()
                  .setAuthor({ name: `${personaname} has left`, iconURL: avatarfull, url: profileurl })
                  .setDescription(`**User:** [${personaname}](${profileurl})\n**SteamID:** [${steamid}](${profileurl}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid})`)
                    .setTimestamp()
                    .setFooter({ text: "Left" })
                    .setColor(server.SERVER_LOGGING.SERVER_LEAVE_LOGS.EMBED_COLOR)
                  
                  hook.send({ embeds: [embed] });
                  } catch (err) {

                  }

              });

              }
            }

        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = playerLeft;
