const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config.json');

const steamAccount = (steamID) => {
    
    return new Promise((resolve, reject) => {

        if(!steamID) {
            reject("Error while receiving details...");
        }

        fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${steamID}`).then(res => res.text()).then(steam => {
            try {
                steam = JSON.parse(steam);
                if(!steam.response.players[0]) {
                    return;
                }

                const { personaname, avatarfull, profileurl, steamid, communityvisibilitystate } = steam.response.players[0];

                resolve({ 'personaname': personaname, 'avatarfull': avatarfull, 'profileurl': profileurl, 'steamid': steamid, 'profilestatus': communityvisibilitystate });
            } catch (err) {
                reject("Error while checking steam profile.");
            }

        });
    });
 
}

module.exports = steamAccount;
