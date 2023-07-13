const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config.json');
const moment = require('moment');
const { loadImage, createCanvas } = require('canvas');
const fs = require('fs');
let db = new sqlite3.Database('./src/database/serverStatus.sqlite3', (err) => {
    if(err) return console.log(err);
});
let db2 = new sqlite3.Database('./src/database/serverLogs.sqlite3', (err) => {
    if(err) return console.log(err);
});

const serverStatus = (server, channel) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }

        if(server.SERVER_STATUS_PAGE.ENABLED) {
            setInterval(() => {
                db.all(`select * from server_status where channel_id = '${server.SERVER_STATUS_PAGE.CHANNEL_ID}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                    if(err) console.log(err);
                    if(table.length > 0) {
                        channel.messages.fetch(table[0].message_id).then(messageID => {
                            const embed = new Discord.EmbedBuilder();
                            db2.all(`SELECT * from server_logs where server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                if(err) console.log(err);
                                if(table !== undefined) {                                    
                
                                    const width = 900;
                                    const height = 341;
                                    const canvas = createCanvas(width, height)
                                    const context = canvas.getContext('2d')
                                    context.fillStyle = '#2b03a3'
                                    context.fillRect(0, 0, width, height)
                                    context.font = 'bold 32pt Sans'
                                    context.textBaseline = 'top'
                                    context.textAlign = 'left'
                                    context.fillStyle = '#f0f0f0'
                                    loadImage('./src/images/ServerStatus.png').then(async (data) => {
                                     context.drawImage(data, 0, 0, 900, 341);
                                        context.font = 'bold 30pt Sans';
                                        context.textBaseline = 'middle'
                                        context.textAlign = 'center'
                                        context.fillText(server.SERVER_SHORTNAME, 450, 35);
                                        context.font = 'bold 47pt Sans';
                                        context.fillText(table[0].current_players, 156, 179);
                                        context.fillText(table[0].joining_players, 450, 179);
                                        context.fillText(table[0].queued_players, 750, 179);
                                        context.font = 'bold 30pt Sans';
                                        context.fillText(`Last wipe: ${moment.unix(table[0].last_wipe).format("MM/DD/YYYY")}`, 450, 304);

                                        const imgBuffer = canvas.toBuffer('image/png')
                                        fs.writeFileSync(`./src/images/ServerStatus_${server.SERVER_SPECIAL_ID}.png`, imgBuffer)
                                        const attachment = new Discord.AttachmentBuilder(`./src/images/ServerStatus_${server.SERVER_SPECIAL_ID}.png`);
                                        embed.setImage(`attachment://ServerStatus_${server.SERVER_SPECIAL_ID}.png`)
                                        messageID.edit({ embeds: [embed.setImage(`attachment://ServerStatus_${server.SERVER_SPECIAL_ID}.png`)], files: [attachment] });                                            
                                    });
                                }
                            })
                        }).catch(err => {
                            const embed = new Discord.EmbedBuilder();
                            const attachment = new Discord.AttachmentBuilder(`./src/images/ServerStatus.png`);
                            embed.setImage(`attachment://ServerStatus.png`)
                            channel.send({ embeds: [embed.setTitle(server.SERVER_SHORTNAME).setImage(`attachment://ServerStatus.png`)], files: [attachment] }).then(theMsg => {
                                db.all(`update server_status set message_id = ${theMsg.id} where channel_id = ${server.SERVER_STATUS_PAGE.CHANNEL_ID} and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                                    if(err) console.log(err);
                                });    
                            }); 
                        })
                    } else {
                        const embed = new Discord.EmbedBuilder();
                        const attachment = new Discord.AttachmentBuilder(`./src/images/ServerStatus.png`);
                        embed.setImage(`attachment://ServerStatus.png`)
                        channel.send({ embeds: [embed.setTitle(server.SERVER_SHORTNAME).setImage(`attachment://ServerStatus.png`)], files: [attachment] }).then(theMsg => {
                            db.all(`insert into server_status (channel_id, message_id, server_id) values (${server.SERVER_STATUS_PAGE.CHANNEL_ID}, ${theMsg.id}, '${server.SERVER_SPECIAL_ID}');`, async function(err, table) {
                                if(err) console.log(err);
                            });
                        });
                    }
                });
            }, 10000)
        }
    });
 
}

module.exports = serverStatus;
