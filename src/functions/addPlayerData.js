const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/userDatabase.sqlite3', (err) => {
    if(err) return console.log(err);
});

const addPlayerData = (steamID, server) => {
    
    return new Promise((resolve, reject) => {

        if(!steamID) {
            reject("Error while receiving details...");
        }

        try {
            db.all(`SELECT * from player_info where steam_id = '${steamID}' and server_id = '${server.SERVER_SPECIAL_ID}';`, async function(err, table) {
                if(err) reject(err);
                if(table.length < 1) {
                    db.all("INSERT into player_info (steam_id, report_count, kills, deaths, chat_messages, connections, server_id) values ('"+ steamID +"', 0, 0, 0, 0, 0, '"+server.SERVER_SPECIAL_ID+"')", async function(err, table) {
                        if(err) reject(err);
                        resolve("Success");
                    })
                } else resolve("Done");
            });
        } catch(err) {
            reject(err);
        }
    });
 
}

module.exports = addPlayerData;
