const rustrcon = require('rustrcon');
const config = require('../../config.json');
const { Client, Collection, ActivityType, GatewayIntentBits, Partials, EmbedBuilder, WebhookClient, ActionRowBuilder, Embed } = require("discord.js");
const moment = require("moment");
const chalk = require('chalk');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const onlineMessage = require('../functions/onlineMessage.js');
const offlineMessage = require('../functions/offlineMessage.js');
const botStatus = require('../functions/botStatus');
const banChecker = require('../functions/banChecker');
const addPlayerData = require('../functions/addPlayerData');
const playerJoined = require('../functions/playerJoined');
const f7Logs = require('../functions/f7Logs');
const killLogs = require('../functions/killLogs');
const sqlite3 = require('sqlite3');
const leaderboard = require('../functions/leaderboard');
const chatMessages = require('../functions/chatMessages');
const wipeAnnouncement = require('../functions/wipeAnnouncement');
const serverStatus = require('../functions/serverStatus');
const f1Logs = require('../functions/f1Logs');
const popChanged = require('../functions/popChanged');
const playerLeft = require('../functions/playerLeft');
const privateProfile = require('../functions/privateProfile');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});
let servers_db = new sqlite3.Database('./src/database/serverLogs.sqlite3', (err) => {
    if(err) return console.log(err);
});
let servers = [];
fs.readdirSync('./SERVERS/').forEach(async file => {
    const configContents = require(`../../SERVERS/${file}`);
    servers.push(configContents);
});
let globalStatus = [];


function initiateGlobalBot() {
    const totalPopulationBot = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});

    totalPopulationBot.on("ready", () => {
  
      setInterval(async () => {
      let popMessage = "";
        const totalPop = await getTotalPopulation().catch(() => null);
  
        if (!totalPop || totalPop == null) return;
          if(!config.GLOBAL_POP_BOT.MULTI_MESSAGE.ENABLED) {
              popMessage = config.GLOBAL_POP_BOT.SINGLE_MESSAGE.PLAYER_COUNT_MESSAGE.replace(/{OnlineJoiningQueued}/gi, totalPop.playersOnline+totalPop.playersJoining+totalPop.playersQueued);
              popMessage = popMessage.replace(/{maxPlayers}/gi, totalPop.maxPlayers);
          } else {
              if(totalPop.playersQueued !== 0) {

                  popMessage = config.GLOBAL_POP_BOT.MULTI_MESSAGE.PLAYERS_QUEUED_MESSAGE.replace(/{playersOnline}/gi, totalPop.playersOnline);
                  popMessage = popMessage.replace(/{maxPlayers}/gi, totalPop.maxPlayers);
                  popMessage = popMessage.replace(/{joiningPlayers}/gi, totalPop.playersJoining);
                  popMessage = popMessage.replace(/{queuedPlayers}/gi, totalPop.playersQueued);

              } else if(totalPop.playersJoining !== 0) {

                  popMessage = config.GLOBAL_POP_BOT.MULTI_MESSAGE.PLAYERS_JOINING_MESSAGE.replace(/{playersOnline}/gi, totalPop.playersOnline);
                  popMessage = popMessage.replace(/{maxPlayers}/gi, totalPop.maxPlayers);
                  popMessage = popMessage.replace(/{joiningPlayers}/gi, totalPop.playersJoining);
                  popMessage = popMessage.replace(/{queuedPlayers}/gi, totalPop.playersQueued);

              } else {

                  popMessage = config.GLOBAL_POP_BOT.MULTI_MESSAGE.PLAYER_COUNT_MESSAGE.replace(/{playersOnline}/gi, totalPop.playersOnline);
                  popMessage = popMessage.replace(/{maxPlayers}/gi, totalPop.maxPlayers);
                  popMessage = popMessage.replace(/{joiningPlayers}/gi, totalPop.playersJoining);
                  popMessage = popMessage.replace(/{queuedPlayers}/gi, totalPop.playersQueued);

              }
          }
        
        console.log(`(${chalk.magenta("GLOBAL")}) => 👉 [ ${chalk.cyan(totalPopulationBot.user.tag)} ] status: ${chalk.cyan(popMessage)}`);  
        totalPopulationBot.user.setPresence({ activities: [{ name: popMessage, type: ActivityType.Watching }], status: "online" });
  
      }, 10000);
  
    });
  
    totalPopulationBot.login(config.GLOBAL_POP_BOT.BOT_TOKEN).then(() => {
  
      totalPopulationBot.user.setPresence({ activities: [{ name: `Establishing connection...`, type: ActivityType.Watching }], status: 'idle' });
  
      console.log(`(${chalk.magenta("GLOBAL")}) => 💚 [ ${chalk.green(totalPopulationBot.user.tag)} ] is online... Proceeding...`);
  
    });
  
  }


if(config.GLOBAL_POP_BOT.ENABLED) initiateGlobalBot();


servers.forEach((server, index) => {
    if(!server.SERVER_ENABLED) return;
    servers_db.all(`select * from server_logs where server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
        if(err) console.log(err);
        if(table.length > 0) return;
        servers_db.all(`insert into server_logs(server_id, current_players, peak_players, last_wipe) values ('${server.SERVER_SPECIAL_ID}', 0, 0, 0);`, async function(err, table) {
            console.log(err);
        });
    })

    const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});

    process.on("unhandledRejection", err => { 
    console.log(err)
    }) 
    process.on("uncaughtException", err => { 
    console.log(err)
    })  
    process.on("uncaughtExceptionMonitor", err => { 
    console.log(err)
    });

    // Checks to see if needed information if provided
    if(!server.SERVER_ENABLED) return;
    if(!server.BOT_TOKEN) return console.log(`You have not provided a bot token for me to use for server (${server.SERVER_SHORTNAME} | INDEX: ${index + 1})`);
    if(!server.SERVER_IP) return console.log(`You have not provided a server IP for me to use for server (${server.SERVER_SHORTNAME} | INDEX: ${index + 1})`);
    if(!server.RCON_PASS) return console.log(`You have not provided a server Password for me to use for server (${server.SERVER_SHORTNAME} | INDEX: ${index + 1})`);
    if(!server.RCON_PORT) return console.log(`You have not provided a server Port for me to use for server (${server.SERVER_SHORTNAME} | INDEX: ${index + 1})`);
    if(server.SERVER_IP.includes(":")) {
        rcon_IP.slice(":");
        rcon_IP = rcon_IP[0];
    }

    let rcon = new rustrcon.Client({
        ip: server.SERVER_IP,
        port: server.RCON_PORT,
        password: server.RCON_PASS
    });

    server.connected = false;
    server.checkServerStatus = null;
    let wipeObject = { serverSeed: "", serverSize: "", wipeDate: "" };
    let messagesArray = [];

    client.on('ready', async () => {
        console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 💛 [ ${chalk.yellow(client.user.tag)} ] is online!`);
        const channel = client.channels.cache.get(server.LEADERBOARD.CHANNEL_ID);
        const channel2 = client.channels.cache.get(server.SERVER_STATUS_PAGE.CHANNEL_ID);
        runConnection();
        if(server.LEADERBOARD.ENABLED) leaderboard(server, channel);
        if(server.SERVER_STATUS_PAGE) serverStatus(server, channel2);
    });

    client.on('messageCreate', message => {
        if(message.author.bot) return;
        if(server.CHAT_LOGS.DISCORD_TO_INGAME_MESSAGES.ENABLED) {
            if(server.CHAT_LOGS.DISCORD_TO_INGAME_MESSAGES.CHAT_CHANNEL_IDS.find(channel => message.channel.id == channel)) {
                if(server.CHAT_LOGS.DISCORD_TO_INGAME_MESSAGES.REQUIRE_ROLES_TO_SEND_MESSAGES && !server.CHAT_LOGS.DISCORD_TO_INGAME_MESSAGES.REQUIRED_ROLES.find(roleID => message.member.roles.cache.has(roleID))) return message.react('❌');
                let messageFormat = server.CHAT_LOGS.DISCORD_TO_INGAME_MESSAGES.MESSAGE_FORMAT;
                messageFormat = messageFormat.replace(/{user}/gi, message.author.username);
                rcon.send(`say ${messageFormat} ${message.content}`);
                message.react('✅');
            }
        }

        if(server.RCON_SETTINGS.RCON_COMMANDS.ENABLED) {
            if(server.RCON_SETTINGS.RCON_COMMANDS.COMMAND_CHANNEL_IDS.find(channel => message.channel.id == channel)) {
                if(!server.RCON_SETTINGS.RCON_COMMANDS.STAFF_ROLES.find(roleID => message.member.roles.cache.has(roleID))) return message.react('❌');
                rcon.send(message.content, "advrcon", 8888);
                message.react('✅');
            }
        }
    });

    rcon.on("error", err => {
        console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => ❤️ [ ${chalk.red(client.user.tag)} ] has encountered an error while tring to connect to ${chalk.red(`${rcon.ws.ip}:${rcon.ws.port}`)}\n--------- [ ${chalk.red("ERROR")} ] ---------\n${err.message}\n-----------------------------`);
    });

    rcon.on('connected', () => {
        console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 💚 [ ${chalk.green(client.user.tag)} ] has successfully connected to ${chalk.green(`${rcon.ws.ip}:${rcon.ws.port}`)}`);
        client.user.setPresence({ activities: [{ name: `Connected...`, type: ActivityType.Watching }], status: 'idle' });

        server.checkServerStatus = setInterval(() => {
            try {
                rcon.send("serverinfo", "advrcon", 6518);
            } catch(err) {

            }
        }, 5000);

        if(server.WIPE_ANNOUNCMENTS.ENABLED) {
            checkForWipeInfo()

            function checkForWipeInfo() {
                try {
                    rcon.send("worldsize", "advrcon", 9822);
                    rcon.send("seed", "advrcon", 9823);
                    rcon.send("serverinfo", "advrcon", 9824);
                  } catch (err) {
                    setTimeout(() => 5000);
                    checkForWipeInfo();
                  }
            }
        }

        server.popCheck = setInterval(() => {
            try {
                rcon.send("serverinfo", "advrcon", 7496);
            } catch(err) {
                console.log(err);
            }
        }, 10000);
    });

    rcon.on('disconnect', () => {
        if(server.connected) {
            client.user.setPresence({ activities: [{ name: `${server.USE_POP_AS_A_BOT_STATUS.OPTIONS.SERVER_OFFLINE_MESSAGE}`, type: ActivityType.Watching }], status: 'dnd' });
            server.connected = false;
            console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => ❤️ [ ${chalk.red(client.user.tag)} ] has dropped connection to ${chalk.red(`${rcon.ws.ip}:${rcon.ws.port}`)}`);
            if(server.SERVER_ONLINE_OFFLINE.ENABLED) offlineMessage(server);
        } else {
            console.log(`(${chalk.magenta(index+1)}/${chalk.blue(servers.length)}) => 💛 [ ${chalk.yellow(client.user.tag)} ] is attempting a connection to ${chalk.yellow(`${rcon.ws.ip}:${rcon.ws.port}`)}`);
        }
        setTimeout(() => {
            runConnection();
          }, 30000);
    });

    let re = /7656119([0-9]{10})/gm;
    rcon.on("message", async(message) => {
        let messageContent = message.content;
        let messageIdentifier = message.Identifier;
        let messageChannel = messageContent.Channel;
        if(message.Type.toLowerCase() == "chat") {
            chatMessages(messageChannel, messageContent, server);
        }
        if(message.Type.toLowerCase() == "report") {
            f7Logs(messageContent, server);
        }
        if(messageIdentifier == 6518 && server.connected == false) {
            clearInterval(server.checkServerStatus);
            server.connected = true;
            if(server.SERVER_ONLINE_OFFLINE.ENABLED) onlineMessage(server);
            rcon.send("status", "advrcon", 7745);
        } else if(messageIdentifier == 7496) {
            const playersOnline = messageContent.Players;
            const maxPlayers = messageContent.MaxPlayers;
            const queuedPlayers = messageContent.Queued;
            const joiningPlayers = messageContent.Joining;
            const lastWipe = Date.parse(messageContent.SaveCreatedTime + 'Z') / 1000;
            globalStatus[index] = { playersOnline, queuedPlayers, joiningPlayers, maxPlayers };
            servers_db.all(`select * from server_logs where server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                if(err) reject(err);
                if(table.length > 0) {
                    let newMax = parseInt(table[0].peak_players);
                    if((playersOnline + queuedPlayers + joiningPlayers) > parseInt(table[0].peak_players)) newMax = playersOnline + queuedPlayers + joiningPlayers;
                    servers_db.all(`update server_logs set current_players = '${playersOnline}', joining_players = '${joiningPlayers}', queued_players = '${queuedPlayers}', peak_players = '${newMax}', last_wipe = ${lastWipe} where server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                        if(err) console.log(err);
                    });
                }
            })
            if(server.USE_POP_AS_A_BOT_STATUS.ENABLED) {
                botStatus(message, server, servers, index).then(res => client.user.setPresence(res));
            } 

            if(server.DYNAMIC_MAXPLAYERS_CHANGER.ENABLED) {
                popChanged(messageContent, server);
            }
        } else if (messageIdentifier == 7745) {
            let results = messageContent.match(re);
            if(results == null) return;
            results.forEach(user => {
                addPlayerData(user, server);
            })
        } else if(messageIdentifier == 9822) {
            messageContent = messageContent.split(": ");
            wipeObject.serverSize = messageContent[1];
            if(wipeObject.wipeDate && wipeObject.serverSeed && wipeObject.serverSize) wipeAnnouncement(wipeObject, server);
          } else if(messageIdentifier == 9823) {
            messageContent = messageContent.split(": ");
            wipeObject.serverSeed = messageContent[1]
            if(wipeObject.wipeDate && wipeObject.serverSeed && wipeObject.serverSize) wipeAnnouncement(wipeObject, server);
          } else if(messageIdentifier == 9824) {
              const wipedAt = messageContent.SaveCreatedTime;
              let didWipe = false;
              if (Date.parse(wipedAt + 'Z') + (Number(".15") * 3600000) > Date.now()) {
                didWipe = true;
              } else {
                didWipe = false;
              }
              wipeObject.wipeDate = didWipe;
  
              if(wipeObject.wipeDate && wipeObject.serverSeed && wipeObject.serverSize) wipeAnnouncement(wipeObject, server);
  
          } else {
            if(server.RCON_SETTINGS.RCON_MESSAGE_LOGS.ENABLED) {
    
                if(typeof messageContent == 'object') {
                    messageContent = JSON.stringify(messageContent);
                } else {
                  messageContent = messageContent;
                }
      
                if(messagesArray.length < server.RCON_SETTINGS.RCON_MESSAGE_LOGS.MESSAGE_CHUNKING_COUNT && !server.RCON_SETTINGS.RCON_MESSAGE_LOGS.DONT_SEND_RCON_MESSAGES_THAT_INCLUDE.find(theTerm => messageContent.includes(theTerm))) {
                  if(server.RCON_SETTINGS.RCON_MESSAGE_LOGS.SIMPLE_FORMATTING) {
                    msgLength = 1950/server.RCON_SETTINGS.RCON_MESSAGE_LOGS.MESSAGE_CHUNKING_COUNT;
                    if(messageContent.length > msgLength) {
                      messageContent.slice(msgLength);
                      messagesArray.push("```" + messageContent + "```");
                    } else {
                      messagesArray.push("```" + messageContent + "```");
                    }
                  } else {
                    msgLength = 3950/server.RCON_SETTINGS.RCON_MESSAGE_LOGS.MESSAGE_CHUNKING_COUNT;
                    if(messageContent.length > msgLength) {
                      messageContent.slice(msgLength);
                      messagesArray.push("```" + messageContent + "```");
                    } else {
                      messagesArray.push("```" + messageContent + "```");
                    }
                  }
                } else if(messagesArray.length >= server.RCON_SETTINGS.RCON_MESSAGE_LOGS.MESSAGE_CHUNKING_COUNT && !server.RCON_SETTINGS.RCON_MESSAGE_LOGS.DONT_SEND_RCON_MESSAGES_THAT_INCLUDE.find(theTerm => messageContent.includes(theTerm))) {
      
                  let combinedMessages = messagesArray.join("");
      
                    const hook = new WebhookClient({ url: server.RCON_SETTINGS.RCON_MESSAGE_LOGS.LOG_WEBHOOK });
                    if(server.RCON_SETTINGS.RCON_MESSAGE_LOGS.SIMPLE_FORMATTING) {
                      if(combinedMessages.length > 2000) {
                        combinedMessages.slice(2000);
                        combinedMessages = combinedMessages[0];
                      }
      
                      hook.send({ content: `${combinedMessages}` }).then(messagesArray = []);
                    } else {
                      if(combinedMessages.length > 4000) {
                        combinedMessages.slice(4000);
                        combinedMessages = combinedMessages[0];
                      }
      
                      const embed = new EmbedBuilder()
                      .setDescription(`${combinedMessages}`)
                      .setColor(server.RCON_SETTINGS.RCON_MESSAGE_LOGS.EMBED_COLOR)
                      .setTimestamp()
        
                      hook.send({ embeds: [embed] }).then(messagesArray = []);
                    }
      
                }
                    
            }

            if(typeof messageContent !== 'object') {
                if(messageIdentifier == 0 && (messageContent.toLowerCase().includes("joined") || messageContent.toLowerCase().includes("has connected to the server"))) {
                    let results = messageContent.match(re);
                    if(results !== null) {
                        await addPlayerData(results[0], server);
                        if(server.PLAYER_ACCOUNT_CHECKS.BAN_CHECKER.ENABLED) banChecker(results[0], server);
                        playerJoined(results[0], server);
                        if(server.PLAYER_ACCOUNT_CHECKS.PRIVATE_PROFILE_CHECKER.ENABLED) privateProfile(messageContent, server);
                    }
                } else {
                    if(server.SERVER_LOGGING.PRIVATE_MESSAGES.ENABLED && messageContent.includes("[PrivateMessages]")) {
                        let hook = new WebhookClient({ url: server.SERVER_LOGGING.PRIVATE_MESSAGES.LOG_WEBHOOK });
                        let newMessage = messageContent.split("[PrivateMessages] ");
                        newMessage = newMessage[1];
                        const embed = new EmbedBuilder()
                          .setAuthor({ name: `PRIVATE MESSAGE` })
                          .setDescription(newMessage)
                          .setTimestamp()
                          .setFooter({ text: "Messaged" })
                          .setColor(server.SERVER_LOGGING.PRIVATE_MESSAGES.EMBED_COLOR)
                        
                        hook.send({ embeds: [embed] });
                    }else if(messageIdentifier == 0 && messageContent.toLowerCase().includes("disconnecting:")){
                        playerLeft(messageContent, server);
                    } else if(messageIdentifier == 0 && messageContent.toLowerCase().includes("was killed by")) {
                        let results = messageContent.match(re);
                        if(results !== null && results !== undefined && results.length == 2) {
                            db.all(`select * from player_info where steam_id = '${results[0]}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                if(err) reject(err);
                                if(table.length > 0) {
                                    db.all(`update player_info set deaths = ${parseInt(table[0].deaths) + 1} where steam_id = '${results[0]}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                        if(err) reject(err);}
                                    )
                                }
                            });
                            db.all(`select * from player_info where steam_id = ${results[1]} and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                if(err) reject(err);
                                if(table.length > 0) {
                                    db.all(`update player_info set kills = ${parseInt(table[0].kills) + 1} where steam_id = '${results[1]}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                        if(err) reject(err);}
                                    )
                                }
                            });
                        }
                        if(server.SERVER_LOGGING.KILL_LOGS.ENABLED) {
                            let sortItOut2 = /\[(.*?)\]\s*([\w\s'’`~!@#$%^&*()-+=\\|{}\[\];:'",<.>/?]+?)\[(\d+)\/(\d+)\]\s+(?:no team|was killed by)?\s+\[(.*?)\]\s*([\w\s'’`~!@#$%^&*()-+=\\|{}\[\];:'",<.>/?]+?)\[(\d+)\/(\d+)\]\s+at\s+\((-?\d+\.\d+),\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\)/;
                            const match = messageContent.match(sortItOut2);
                            if (match) {
                              const result = [    match[1], // team
                                match[2], // name
                                match[3] ? match[3] : 'No ID Found', // userID
                                match[4], // steamID
                                match[5], // team
                                match[6], // name
                                match[7] ? match[7] : 'No ID Found', // userID
                                match[8], // steamID
                                match[9], // x
                                match[10], // y
                                match[11], // z
                              ];
                              killLogs(true, result, server);
                            } else {
                              killLogs(false, messageContent, server);
                            };
                        }
                    } else if(messageIdentifier == 0 && messageContent.includes("[ServerVar] giving") && server.SERVER_LOGGING.F1_SPAWN_ITEM_LOGS.ENABLED) {
                        f1Logs(messageContent, server);
                    }
                }
            } else {

            }
        }
    });

    client.login(server.BOT_TOKEN);

    function runConnection() {
        console.log(`(${chalk.magenta(index + 1)}/${chalk.blue(servers.length)}) => 💛 [ ${chalk.yellow(client.user.tag)} ] is attempting a connection to ${chalk.yellow(server.SERVER_SHORTNAME)}`);
        rcon.login();
    }
    

});

async function getTotalPopulation() {

    return new Promise((res, rej) => {
  
      if (globalStatus.length === 0) rej("No servers are being found (Total POP bot)...");
  
      let totalData = { playersOnline: 0, playersQueued: 0, playersJoining: 0, maxPlayers: 0 };
  
      globalStatus.forEach(({ playersOnline, queuedPlayers, joiningPlayers, maxPlayers }, index, array) => {
        totalData.playersOnline += playersOnline;
        totalData.playersQueued += queuedPlayers;
        totalData.playersJoining += joiningPlayers;
        totalData.maxPlayers += maxPlayers;
        if (index === array.length - 1) res(totalData);
  
      });
      
    });
  }