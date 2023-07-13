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
    .setName("f7-reports")
    .setDescription("Add a watch to a player")
    .addStringOption(Option => Option.setName('steam-64-id').setDescription("The users steam 64ID").setRequired(true))
    .addBooleanOption(Option => Option.setName('ignore_reports_from').setDescription("If the users f7 reports from players should be ignored").setRequired(true))
    .addBooleanOption(Option => Option.setName('ignore_reports_against').setDescription("If the users f7 reports towards players should be ignored").setRequired(true)),
    run: async (client, interaction) => {
    
    if(!config.PLAYER_PROFILER.STATS_COMMAND.ENABLED) return interaction.reply("This command has been disabled in the config.");
    if(config.PLAYER_PROFILER.STATS_COMMAND.REQUIRE_ROLES && !config.PLAYER_PROFILER.STATS_COMMAND.REQUIRED_ROLES.find(id => interaction.member.roles.cache.has(id))) return interaction.reply("You do not have permission to use this command");
    let re = /7656119([0-9]{10})/gm;
        if(interaction.options._hoistedOptions[0].value.match(re) == null) return interaction.reply("Not a valid steam 64ID! Steam 64ID's start with 765611");
        db.all(`update player_info set ignore_f7_from = ${interaction.options._hoistedOptions[1].value} and ignore_f7_against = ${interaction.options._hoistedOptions[2].value} where steam_id = '${interaction.options._hoistedOptions[0].value}';`);
        interaction.reply("Users f7 status has successfully been changed");
    }
 };
