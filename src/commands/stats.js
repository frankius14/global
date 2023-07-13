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
    .setName("stats")
    .setDescription("Checks your stats")
    .addStringOption(Option => Option.setName('steam-64-id').setDescription("Your steam 64ID starts with 765611").setRequired(true)),
    run: async (client, interaction) => {
    
      if(!config.PLAYER_PROFILER.STATS_COMMAND.ENABLED) return interaction.reply("This command has been disabled in the config.");
      if(config.PLAYER_PROFILER.STATS_COMMAND.REQUIRE_ROLES && !config.PLAYER_PROFILER.STATS_COMMAND.REQUIRED_ROLES.find(id => interaction.member.roles.cache.has(id))) return interaction.reply("You do not have permission to use this command");
      db.all("SELECT * from player_info where steam_id = '"+ interaction.options._hoistedOptions[0].value +"';", async function(err, table) {
        let re = /7656119([0-9]{10})/gm;
        if(interaction.options._hoistedOptions[0].value.match(re) == null) return interaction.reply("Not a valid steam 64ID! Steam 64ID's start with 765611");
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

                                    const width = 900;
                                    const height = 341;
                                    const canvas = createCanvas(width, height)
                                    const context = canvas.getContext('2d')
                                    context.fillStyle = '#2b03a3'
                                    context.fillRect(0, 0, width, height)
                                    context.textBaseline = 'middle'
                                    context.fillStyle = '#f0f0f0'
                                    loadImage('./src/images/StatsPage.png').then((data) => {
                                      context.drawImage(data, 0, 0, 900, 341)
                                      loadImage(avatarfull).then(async (profileImage) => {
                                        context.font = 'bold 26pt Sans'
                                        context.textAlign = 'left'
                                        context.drawImage(profileImage, 12, 12, 47, 47)
                                        context.fillText(personaname, 75, 34);
                                        context.textAlign = 'center'
                                        context.fillText(steamid, 450, 302)
                                        context.font = 'bold 36pt Sans';
                                        context.fillText((table[0].kills).toLocaleString('en-US'), 156, 179);
                                        context.fillText((table[0].deaths).toLocaleString('en-US'), 450, 179);
                                        context.fillText((table[0].kills / table[0].deaths).toFixed(2), 750, 179);

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
