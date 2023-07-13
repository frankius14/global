const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config.json');
const { loadImage, createCanvas, registerFont } = require('canvas');
registerFont('OpenSans-ExtraBold.ttf', { family: 'Sans' , weight: 'bold' })
const fs = require('fs');
let db = new sqlite3.Database('./src/database/leaderboard.sqlite3', (err) => {
    if(err) return console.log(err);
});
let db2 = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const leaderboard = (server, channel) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }

            if(server.LEADERBOARD.ENABLED) {
                setInterval(() => {
                    db.all(`select * from leaderboard where channel_id = '${server.LEADERBOARD.CHANNEL_ID}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                        if(err) console.log(err);
                        if(table.length > 0) {
                            channel.messages.fetch(table[0].message_id).then(messageID => {
                                const embed = new Discord.EmbedBuilder();
                                db2.all(`SELECT * from player_info where server_id = '${server.SERVER_SPECIAL_ID}' order by kills desc limit 5;`, async function(err, table) {
                                    if(err) console.log(err);
                                    if(table !== undefined) {
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
                                        context.font = 'bold 32pt "Sans"'
                                        context.textBaseline = 'top'
                                        context.textAlign = 'left'
                                        context.fillStyle = '#f0f0f0'
                                        loadImage('./src/images/Leaderboard.png').then(async (data) => {
                                            context.drawImage(data, 0, 0, 1920, 1080);
                                            let theIndex = 0;
                                            for(let account of accountsInfo) {
                                                theIndex = theIndex + 1;
                                                await loadImage(account.avatarfull).then(async (profileImage) => {
                                                    context.font = 'bold 36pt "Sans"';
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
                                            fs.writeFileSync(`./src/images/leaderboard_${server.SERVER_SPECIAL_ID}.png`, imgBuffer)
                                            const attachment = new Discord.AttachmentBuilder(`./src/images/leaderboard_${server.SERVER_SPECIAL_ID}.png`);
                                            embed.setImage(`attachment://leaderboard_${server.SERVER_SPECIAL_ID}.png`)
                                            messageID.edit({ embeds: [embed.setTitle(server.SERVER_SHORTNAME).setImage(`attachment://leaderboard_${server.SERVER_SPECIAL_ID}.png`).setTimestamp().setFooter({text:"Leaderboard / last updated"})], files: [attachment] });                                            
                                        });
                                    }
                                })
                            }).catch(err => {
                                const embed = new Discord.EmbedBuilder();
                                const attachment = new Discord.AttachmentBuilder(`./src/images/Leaderboard.png`);
                                embed.setImage(`attachment://Leaderboard.png`)
                                channel.send({ embeds: [embed.setTitle(server.SERVER_SHORTNAME).setImage(`attachment://Leaderboard.png`).setTimestamp().setFooter({text:"Leaderboard / last updated"})], files: [attachment] }).then(theMsg => {
                                    db.all(`update leaderboard set message_id = ${theMsg.id} where channel_id = ${server.LEADERBOARD.CHANNEL_ID} and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                        if(err) console.log(err);
                                    });    
                                }); 
                            })
                        } else {
                            const embed = new Discord.EmbedBuilder();
                            const attachment = new Discord.AttachmentBuilder(`./src/images/Leaderboard.png`);
                            embed.setImage(`attachment://Leaderboard.png`)
                            channel.send({ embeds: [embed.setTitle(server.SERVER_SHORTNAME).setImage(`attachment://Leaderboard.png`).setTimestamp().setFooter({text:"Leaderboard / last updated"})], files: [attachment] }).then(theMsg => {
                                db.all(`insert into leaderboard (channel_id, message_id, server_id) values (${server.LEADERBOARD.CHANNEL_ID}, ${theMsg.id}, '${server.SERVER_SPECIAL_ID}');`, async function(err, table) {
                                    if(err) console.log(err);
                                });
                            });
                        }
                    });
                }, 60000)
            }
    });
 
}

module.exports = leaderboard;
