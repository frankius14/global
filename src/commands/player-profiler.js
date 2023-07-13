const { EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const { loadImage, createCanvas } = require('canvas');
const fs = require('fs');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("player-profiler")
    .setDescription("Checks a players Ultimate RCON profile.")
    .addStringOption(Option => Option.setName('steam-64-id').setDescription("The users steam 64ID").setRequired(true)),
    run: async (client, interaction) => {
    
      if(!config.PLAYER_PROFILER.PROFILE_VIEW.ENABLED) return interaction.reply("This command has been disabled in the config.");
      if(config.PLAYER_PROFILER.PROFILE_VIEW.REQUIRE_ROLES && !config.PLAYER_PROFILER.PROFILE_VIEW.REQUIRED_ROLES.find(id => interaction.member.roles.cache.has(id))) return interaction.reply("You do not have permission to use this command");
      db.all("SELECT * from player_info where steam_id = '"+ interaction.options._hoistedOptions[0].value +"';", async function(err, table) {
        if(err) reject(err);
        if(table.length > 0) {
          const embed = new EmbedBuilder();
          fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${interaction.options._hoistedOptions[0].value}`).then(res => res.json()).then(async result => {
            if(!result.response.players[0]) {
                await interaction.deferReply({ ephemeral: true });
                interaction.reply({
                    embeds: [embed.setDescription("Please enter a valid steam64 ID only!")]
                });
            } else {
                let { personaname, avatarfull, profileurl, steamid, timecreated } = result.response.players[0];

                                    const width = 1920;
                                    const height = 1080;
                                    const canvas = createCanvas(width, height)
                                    const context = canvas.getContext('2d')
                                    context.fillStyle = '#2b03a3'
                                    context.fillRect(0, 0, width, height)
                                    context.font = 'bold 32pt Sans'
                                    context.textBaseline = 'top'
                                    context.textAlign = 'left'
                                    context.fillStyle = '#f0f0f0'
                                    loadImage('./src/images/PlayerProfiler.png').then((data) => {
                                      context.drawImage(data, 0, 0, 1920, 1080)
                                      loadImage(avatarfull).then(async (profileImage) => {
                                        context.font = 'bold 55pt Sans'
                                        context.drawImage(profileImage, 84, 380, 646, 646)
                                        context.fillText(personaname, 84, 75);
                                        context.fillText(steamid, 84, 155)
                                        context.font = 'bold 36pt Sans';
                                        context.textBaseline = 'middle'
                                        context.textAlign = 'center'
                                        context.fillText((table[0].kills).toLocaleString('en-US'), 975, 423);
                                        context.fillText((table[0].deaths).toLocaleString('en-US'), 1352, 423);
                                        context.fillText((table[0].kills / table[0].deaths).toFixed(2), 1731, 423);
                                        context.fillText((table[0].report_count).toLocaleString('en-US'), 975, 667);
                                        context.fillText((table[0].chat_messages).toLocaleString('en-US'), 1352, 667);
                                        context.fillText((table[0].connections).toLocaleString('en-US'), 1731, 667);

                                        context.fillText(table[0].watchlist == 0 ? "FALSE" : "TRUE", 975, 914);
                                        context.fillText(table[0].ignore_f7_from == 0 ? "FALSE" : "TRUE", 1352, 914);
                                        context.fillText(table[0].ignore_f7_against == 0 ? "FALSE" : "TRUE", 1731, 914);

                                        context.fillStyle = '#ffffff'
                                        const imgBuffer = canvas.toBuffer('image/png')
                                        fs.writeFileSync(`./src/images/${steamid}.png`, imgBuffer)
                                        const attachment = new AttachmentBuilder(`./src/images/${steamid}.png`);
                                        embed.setImage(`attachment://${steamid}.png`)
                                        interaction.reply({ embeds: [embed.setImage(`attachment://${steamid}.png`).setTimestamp().setFooter({text:"Requested"}).setAuthor({name:`${personaname}'s stats`, url: profileurl, iconURL: avatarfull})], files: [attachment] });                                            
                                    
                                    })
                                    });
            }
        });
        } else {
          interaction.reply(`Nobody found in the database with the steam ID ${interaction.options._hoistedOptions[0].value}`)
        }
    });
    }
 };
