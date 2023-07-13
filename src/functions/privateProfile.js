const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const steamAccount = require('./steamAccount');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});
const config = require('../../config.json');

const privateProfile = (messageContent, server) => {
    
    return new Promise(async (resolve, reject) => {

        if(!messageContent) {
            reject("Error while receiving details...");
        }

        try {
          let re = /7656119([0-9]{10})/gm;
            let results = messageContent.match(re);
            if(results !== null) {
                let userInfo = await steamAccount(results[0]);
                if(userInfo.communityvisibilitystate == 3) {
                    let rolesArray = [];
                    server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.MENTION_STAFF_ROLES.forEach(roleID => { if(!roleID.toLowerCase().includes("ROLE_ID")) rolesArray.push(`<@&${roleID}>`) });
                    let hook = new Discord.WebhookClient({ url: server.PLAYER_ACCOUNT_CHECKS.PRIVATE_PROFILE_CHECKER.LOG_WEBHOOK });
                
                    const embed = new Discord.EmbedBuilder()
                      .setAuthor({ name: `PRIVATE PROFILE`, url: `https://steamcommunity.com/profiles/${userInfo.steamid}/` })
                      .setDescription(`**User:** ${userInfo.personaname}\n[${userInfo.steamid}](${userInfo.profileurl}) / [BM](https://www.battlemetrics.com/rcon/players?filter[search]=${userInfo.steamid})`)
                      .setThumbnail(userInfo.avatarfull)
                      .setTimestamp()
                      .setFooter({ text: "Detected" })
                      .setColor(server.PLAYER_ACCOUNT_CHECKS.PRIVATE_PROFILE_CHECKER.EMBED_COLOR)
                    
                    hook.send({ embeds: [embed], content: `**PRIVATE PROFILE:** ${rolesArray.join(", ")}` });
                }
            }

        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = privateProfile;
