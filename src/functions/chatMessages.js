const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const chatMessages = (MsgChannel, MsgContent, server) => {
    
    return new Promise((resolve, reject) => {

        try {
            if(MsgChannel == "0" && server.CHAT_LOGS.DO_YOU_USE_BETTER_CHAT && server.CHAT_LOGS.GLOBAL_CHAT_LOGS.ENABLED) {
                const hook = new Discord.WebhookClient({ url: server.CHAT_LOGS.GLOBAL_CHAT_LOGS.GLOBAL_CHAT_WEBHOOK });
                betterChatMessages(hook, MsgContent, server.CHAT_LOGS.GLOBAL_CHAT_LOGS.SIMPLE_FORMATTING, server.CHAT_LOGS.GLOBAL_CHAT_LOGS.EMBED_COLOR, "GLOBAL", "💬");

            } else if(MsgChannel == "1" && server.CHAT_LOGS.DO_YOU_USE_BETTER_CHAT && server.CHAT_LOGS.TEAM_CHAT_LOGS.ENABLED) {
                const hook = new Discord.WebhookClient({ url: server.CHAT_LOGS.TEAM_CHAT_LOGS.TEAM_CHAT_WEBHOOK });
                betterChatMessages(hook, MsgContent, server.CHAT_LOGS.TEAM_CHAT_LOGS.SIMPLE_FORMATTING, server.CHAT_LOGS.TEAM_CHAT_LOGS.EMBED_COLOR, "TEAM", "💬");

            } else if(MsgChannel == "0" && server.CHAT_LOGS.GLOBAL_CHAT_LOGS.ENABLED && !server.CHAT_LOGS.DO_YOU_USE_BETTER_CHAT) {
                const hook = new Discord.WebhookClient({ url: server.CHAT_LOGS.GLOBAL_CHAT_LOGS.GLOBAL_CHAT_WEBHOOK });
                normalChatMessages(hook, MsgContent, server.CHAT_LOGS.GLOBAL_CHAT_LOGS.SIMPLE_FORMATTING, server.CHAT_LOGS.GLOBAL_CHAT_LOGS.EMBED_COLOR, "GLOBAL", "💬");

            } else if(MsgChannel == "1" && server.CHAT_LOGS.TEAM_CHAT_LOGS.ENABLED && !server.CHAT_LOGS.DO_YOU_USE_BETTER_CHAT) {
                const hook = new Discord.WebhookClient({ url: server.CHAT_LOGS.TEAM_CHAT_LOGS.TEAM_CHAT_WEBHOOK });
                normalChatMessages(hook, MsgContent, server.CHAT_LOGS.TEAM_CHAT_LOGS.SIMPLE_FORMATTING, server.CHAT_LOGS.TEAM_CHAT_LOGS.EMBED_COLOR, "TEAM", "💬");

            } else if(MsgChannel == "2" && server.SERVER_LOGGING['(SERVER)MESSAGE_LOGS'].ENABLED) {
              const hook = new Discord.WebhookClient({ url: server.SERVER_LOGGING['(SERVER)MESSAGE_LOGS'].LOG_WEBHOOK });

              const embed = new Discord.EmbedBuilder()
              .setDescription(`**SERVER:** ${MsgContent.Message}`)
              .setColor(server.SERVER_LOGGING['(SERVER)MESSAGE_LOGS'].EMBED_COLOR)
              .setFooter({ text: `Server Message` })
              .setTimestamp()

              hook.send({ embeds: [embed] });

            } else if(MsgChannel == "4" && server.CHAT_LOGS.LOCAL_CHAT_LOGS.ENABLED) {
              const hook = new Discord.WebhookClient({ url: server.CHAT_LOGS.LOCAL_CHAT_LOGS.LOCAL_CHAT_WEBHOOK });

              if(server.CHAT_LOGS.LOCAL_CHAT_LOGS.SIMPLE_FORMATTING) {
                MsgContent.Username = MsgContent.Username.replace(/@everyone/gi, "@ everyone");
                MsgContent.Message = MsgContent.Message.replace(/@everyone/gi, "@ everyone");
                MsgContent.Message = MsgContent.Message.replace(/@here/gi, "@ here");
                MsgContent.Username = MsgContent.Username.replace(/@here/gi, "@ here");
                const stringText = `💬 [LOCAL] [STEAM](<https://steamcommunity.com/profiles/${MsgContent.UserId}>) **/** [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId}) **|  ${MsgContent.Username}:** ${MsgContent.Message}`;

                hook.send({ content: stringText });
              } else {
                const embed = new Discord.EmbedBuilder()
                .setDescription(`**LOCAL:** | [STEAM](https://steamcommunity.com/profiles/${MsgContent.UserId}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId})\n > **${MsgContent.Username}**: ${MsgContent.Message}`)
                .setColor(server.CHAT_LOGS.LOCAL_CHAT_LOGS.EMBED_COLOR)
                .setFooter({ text: `${MsgContent.UserId}` })
                .setTimestamp()

                hook.send({ embeds: [embed] });
              }
            }

            function betterChatMessages(hook, MsgContent, simpleFormatting, embedColor, type, emoji) {
                if(simpleFormatting) {
                    MsgContent.Message = MsgContent.Message.replace(/@everyone/gi, "@ everyone");
                    MsgContent.Message = MsgContent.Message.replace(/@here/gi, "@ here");
                    const stringText = `${emoji} [${type}] [STEAM](<https://steamcommunity.com/profiles/${MsgContent.UserId}>) **/** [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId}) **|** ${MsgContent.Message}`;
    
                    hook.send({ content: stringText });
                  } else {
                    const embed = new Discord.EmbedBuilder()
                    .setDescription(`**${type}:** | [STEAM](https://steamcommunity.com/profiles/${MsgContent.UserId}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId}) \n> ${MsgContent.Message}`)
                    .setColor(embedColor)
                    .setFooter({ text: `${MsgContent.UserId}` })
                    .setTimestamp()
    
                    hook.send({ embeds: [embed] });
                  }
            }

            function normalChatMessages(hook, MsgContent, simpleFormatting, embedColor) {
              if(simpleFormatting) {
                MsgContent.Username = MsgContent.Username.replace(/@everyone/gi, "@ everyone");
                MsgContent.Message = MsgContent.Message.replace(/@everyone/gi, "@ everyone");
                MsgContent.Message = MsgContent.Message.replace(/@here/gi, "@ here");
                MsgContent.Username = MsgContent.Username.replace(/@here/gi, "@ here");
                const stringText = `${emoji} [${type}] [STEAM](<https://steamcommunity.com/profiles/${MsgContent.UserId}>) **/** [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId}) **|  ${MsgContent.Username}:** ${MsgContent.Message}`;

                hook.send({ content: stringText });
              } else {
                const embed = new Discord.EmbedBuilder()
                .setDescription(`**${type}:** | [STEAM](https://steamcommunity.com/profiles/${MsgContent.UserId}) / [BM](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${MsgContent.UserId})\n > **${MsgContent.Username}**: ${MsgContent.Message}`)
                .setColor(embedColor)
                .setFooter({ text: `${MsgContent.UserId}` })
                .setTimestamp()

                hook.send({ embeds: [embed] });
              }
            }

            if(MsgChannel == ("0" || "1" || "4")) {
              db.all("SELECT * from player_info where steam_id = '"+ MsgContent.UserId +"' and server_id = '"+server.SERVER_SPECIAL_ID+"';", async function(err, table) {
                  if(err) console.log(err);
  
                  db.all("update player_info set chat_messages = '"+ (parseInt(table[0].chat_messages) + 1) +"' where steam_id = '"+ MsgContent.UserId +"' and server_id = '"+server.SERVER_SPECIAL_ID+"';", async function(err, table) {
                      if(err) console.log(err);
                  });
  
              });
          }
          resolve();
        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = chatMessages;
