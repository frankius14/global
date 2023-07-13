require('./src/events/establishConnection.js');

const config = require("./config.json");
const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const chalk = require('chalk');
const { loadImage, createCanvas } = require('canvas');
const fs = require('fs');
let db = new sqlite3.Database('./src/database/leaderboard.sqlite3', (err) => {
    if(err) return console.log(err);
});
let db2 = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

if(config.PLAYER_PROFILER.ENABLED) {
    const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder, Embed } = require("discord.js");
    const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});
    const { readdirSync } = require("fs")
    const moment = require("moment");
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v10');
    const fs = require('fs');
    const sqlite3 = require('sqlite3');
    const fetch = require('node-fetch');
    const { loadImage, createCanvas } = require('canvas');
    
    client.commands = new Collection()
    
    const rest = new REST({ version: '10' }).setToken(config.PLAYER_PROFILER.BOT_TOKEN);
        
    const commands = [];
    readdirSync('./src/commands').forEach(async file => {
      const command = require(`./src/commands/${file}`);
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    })
    
    client.on("ready", async () => {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, config.DISCORD_SERVER_ID),
                    { body: commands },
                );
            } catch (error) {
                console.error(error);
            }
            console.log(`(${chalk.magenta("PLAYER PROFILER")}) => 💚 [ ${chalk.green(client.user.tag)} ] has successfully linked with the player profiler`);

        if(config.PLAYER_PROFILER.GLOBAL_LEADERBOARD.ENABLED) {
            setInterval(() => {
                const channel = client.channels.cache.get(config.PLAYER_PROFILER.GLOBAL_LEADERBOARD.CHANNEL_ID);
                db.all(`select * from leaderboard where channel_id = '${config.PLAYER_PROFILER.GLOBAL_LEADERBOARD.CHANNEL_ID}' and server_id = 'global';`, async function(err, table) {
                    if(err) console.log(err);
                    if(table.length > 0) {
                        channel.messages.fetch(table[0].message_id).then(messageID => {
                            const embed = new EmbedBuilder();
                            db2.all(`SELECT * from player_info order by kills desc limit 5;`, async function(err, table) {
                                if(err) console.log(err);
                                if(table.length > 0) {
                                    let accountsInfo = [];
                                    
                                    for(let user of table) {
                                        await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${user.steam_id}`).then(res => res.json()).then(async result => {
                                            let { personaname, avatarfull, profileurl, steamid, timecreated } = result.response.players[0];
                                            accountsInfo.push({ 'personaname': personaname, 'avatarfull': avatarfull, 'profileurl': profileurl, 'dbInfo': user });
                                        });
                                    }
                
                                    const width = 1920;
                                    const height = 1080;
                                    const canvas = createCanvas(width, height)
                                    const context = canvas.getContext('2d')
                                    context.fillStyle = '#2b03a3'
                                    context.fillRect(0, 0, width, height)
                                    context.font = 'bold 32pt "Open Sans"'
                                    context.textBaseline = 'top'
                                    context.textAlign = 'left'
                                    context.fillStyle = '#f0f0f0'
                                    loadImage('./src/images/Leaderboard.png').then(async (data) => {
                                        context.drawImage(data, 0, 0, 1920, 1080);
                                        let theIndex = 0;
                                        for(let account of accountsInfo) {
                                            theIndex = theIndex + 1;
                                            await loadImage(account.avatarfull).then(async (profileImage) => {
                                                context.font = 'bold 36pt "Open Sans"';
                                                context.textBaseline = 'middle'
                                                context.textAlign = 'left'
                                                let kdr = 0;
                                                if(parseInt(account.dbInfo.kills) > 0 && parseInt(account.dbInfo.deaths) == 0) kdr = parseInt(account.dbInfo.kills);
                                                if(parseInt(account.dbInfo.kills) == 0 && parseInt(account.dbInfo.deaths) == 0) kdr = 0;
                                                if(parseInt(account.dbInfo.kills) > 0 && parseInt(account.dbInfo.deaths) > 0) kdr = parseInt(account.dbInfo.kills) / parseInt(account.dbInfo.deaths);
                                                if(theIndex == 1) {
                                                    context.drawImage(profileImage, 136, 51, 155, 155);
                                                    context.fillText(account.personaname, 340, 80);
                                                    context.fillText(`KILLS: ${account.dbInfo.kills} | DEATHS: ${account.dbInfo.deaths} | KDR: ${kdr.toFixed(2)}`, 340, 171);
                                                } else if(theIndex == 2) {
                                                    context.drawImage(profileImage, 136, 258, 155, 155);
                                                    context.fillText(account.personaname, 340, 286);
                                                    context.fillText(`KILLS: ${account.dbInfo.kills} | DEATHS: ${account.dbInfo.deaths} | KDR: ${kdr.toFixed(2)}`, 340, 377);
                                                } else if(theIndex == 3) {
                                                    context.drawImage(profileImage, 136, 463, 155, 155);
                                                    context.fillText(account.personaname, 340, 492);
                                                    context.fillText(`KILLS: ${account.dbInfo.kills} | DEATHS: ${account.dbInfo.deaths} | KDR: ${kdr.toFixed(2)}`, 340, 583);
                                                } else if(theIndex == 4) {
                                                    context.drawImage(profileImage, 136, 671, 155, 155);
                                                    context.fillText(account.personaname, 340, 698);
                                                    context.fillText(`KILLS: ${account.dbInfo.kills} | DEATHS: ${account.dbInfo.deaths} | KDR: ${kdr.toFixed(2)}`, 340, 789);
                                                } else if(theIndex == 5) {
                                                    context.drawImage(profileImage, 136, 877, 155, 155);
                                                    context.fillText(account.personaname, 340, 904);
                                                    context.fillText(`KILLS: ${account.dbInfo.kills} | DEATHS: ${account.dbInfo.deaths} | KDR: ${kdr.toFixed(2)}`, 340, 995);
                                                }
                                            });
                                        }
                
                
                                        const imgBuffer = canvas.toBuffer('image/png')
                                        fs.writeFileSync(`./src/images/leaderboard_global.png`, imgBuffer)
                                        const attachment = new AttachmentBuilder(`./src/images/leaderboard_global.png`);
                                        embed.setImage(`attachment://leaderboard_global.png`)
                                        messageID.edit({ embeds: [embed.setTitle("GLOBAL LEADERBOARD").setImage(`attachment://leaderboard_global.png`).setTimestamp().setFooter({text:"Global leaderboard / last updated"})], files: [attachment] });                                            
                                    });
                                }
                            })
                        }).catch(err => {
                            const embed = new EmbedBuilder();
                            const attachment = new AttachmentBuilder(`./src/images/Leaderboard.png`);
                            embed.setImage(`attachment://Leaderboard.png`)
                            channel.send({ embeds: [embed.setTitle("GLOBAL LEADERBOARD").setImage(`attachment://Leaderboard.png`).setTimestamp().setFooter({text:"Global leaderboard / last updated"})], files: [attachment] }).then(theMsg => {
                                db.all(`update leaderboard set message_id = ${theMsg.id} where channel_id = ${config.PLAYER_PROFILER.GLOBAL_LEADERBOARD.CHANNEL_ID} and server_id = 'global';`, async function(err, table) {
                                    if(err) console.log(err);
                                });    
                            }); 
                        });
                    } else {
                        const embed = new EmbedBuilder();
                        const attachment = new AttachmentBuilder(`./src/images/Leaderboard.png`);
                        embed.setImage(`attachment://Leaderboard.png`)
                        channel.send({ embeds: [embed.setTitle("GLOBAL LEADERBOARD").setImage(`attachment://Leaderboard.png`).setTimestamp().setFooter({text:"Global leaderboard / last updated"})], files: [attachment] }).then(theMsg => {
                            db.all(`insert into leaderboard (channel_id, message_id, server_id) values (${config.PLAYER_PROFILER.GLOBAL_LEADERBOARD.CHANNEL_ID}, ${theMsg.id}, 'global');`, async function(err, table) {
                                if(err) console.log(err);
                            });
                        });
                    }
                });
            }, 59000)
        }
        
    })
    
    readdirSync('./src/events').forEach(async file => {
        const event = require(`./src/events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    })
    
    process.on("unhandledconsole.logion", err => { 
       console.log(err)
     }) 
    process.on("uncaughtException", err => { 
       console.log(err)
     })  
    process.on("uncaughtExceptionMonitor", err => { 
       console.log(err)
     })
    
    
    client.login(config.PLAYER_PROFILER.BOT_TOKEN)
}
