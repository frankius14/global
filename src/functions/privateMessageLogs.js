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


        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = privateProfile;
