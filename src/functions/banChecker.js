const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config.json');
const steamAccount = require('./steamAccount');

const banChecker = (steamID, server) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }
            let bansArray = [];
            let rolesArray = [];
            steamAccount(steamID).then(res => {
                fetch(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${config.STEAM_API_KEY}&steamids=${steamID}`).then(res => res.text()).then(response => {
                    try {
                      response = JSON.parse(response);
                      let { NumberOfVACBans, NumberOfGameBans, DaysSinceLastBan } = response.players[0];
                      if(DaysSinceLastBan == 0) DaysSinceLastBan = null;
    
                      fetch(`https://rustbans.com/api/${steamID}`).then(res => res.json()).then(response => {
                          if (response == "Steam ID length is not correct.") reject("Error while searching for bans");
              
                          response.forEach(ban => {
                            if(ban.Banned) {
                              let banTime = response[0].BanDateMilliseconds / 1000;
                              bansArray.push(`**Temp banned:** <t:${banTime}:R>\n**Tweet:** ${ban.TweetLink}`);
                            }
                          });
    
                          if(bansArray.length >= server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.THRESHOLDS.RUST_TEMP_BANS || NumberOfVACBans >= server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.THRESHOLDS.VAC_BANS || NumberOfGameBans >= server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.THRESHOLDS.EAC_BANS || (DaysSinceLastBan !== null && DaysSinceLastBan < server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.THRESHOLDS.DAYS_SINCE_LAST_BAN)) {
    
                              let rolesArray = [];
                              let hook = new Discord.WebhookClient({ url: server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.LOG_WEBHOOK });
                  
                              server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.MENTION_STAFF_ROLES.forEach(roleID => {
                                if(roleID == "RoleID") return;
                                rolesArray.push(`<@&${roleID}>`)
                              });

                              const embed = new Discord.EmbedBuilder()
                                .setAuthor({ name: `ACCOUNT ALERT: ${res.personaname}`, url: `https://steamcommunity.com/profiles/${steamID}/` })
                                .setThumbnail(res.avatarfull)
                                .setDescription(`**User:** [${res.personaname} / ${steamID}](https://steamcommunity.com/profiles/${steamID}/)\n**VAC Bans:** ${NumberOfVACBans}\n**EAC Bans:** ${NumberOfGameBans}\n**Days Since last ban:** ${DaysSinceLastBan}\n\n**RUST TEMP BANS:**\n${bansArray.join("\n\n")}`)
                                .setTimestamp()
                                .setFooter({ text: "Detected" })
                                .setColor(server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.EMBED_COLOR)
                              
                              if(rolesArray.length > 0) return hook.send({ embeds: [embed], content: `**ACCOUNT ALERT:** ${rolesArray.join(", ")}` });
                              hook.send({ embeds: [embed], content: `**ACCOUNT ALERT:** ${rolesArray.join(", ")}` });
    
                          }
                      });
                    } catch (err) {
    
                    } 
                  
                });
            }).catch(err => {
                console.log(err);
            });
    });
 
}

module.exports = banChecker;
