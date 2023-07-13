const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const config = require('../../config.json');
const steamAccount = require('./steamAccount');

const popChanged = (messageContent, server) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }

        const playersOnline = messageContent.Players;
        const maxPlayers = messageContent.MaxPlayers;
        const queuedPlayers = messageContent.Queued;
        const joiningPlayers = messageContent.Joining;
        const fps = messageContent.Framerate;
        let popObject = { queue: queuedPlayers, joining: joiningPlayers, online: playersOnline, max: maxPlayers, fps: fps };

        if(server.DYNAMIC_MAXPLAYERS_CHANGER.ENABLED) {
            if(server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.BASIC.ENABLED && !server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.ENABLED) {
                const currentArray = [...server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.BASIC.CONDITIONALS].reverse();
                currentInfo = currentArray.find(theObj => popObject.online >= theObj.POP_IS_GREATER_THAN);
        
                if(currentInfo !== undefined && currentInfo.INCREASE_MAX_PLAYERS_TO > popObject.max && server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.DONT_CHANGE_POP_IF_FPS_IS_LESS_THAN < popObject.fps) {
                    popObject.max = currentInfo.INCREASE_MAX_PLAYERS_TO;
                    resolve({ commandNeeded: true, newPop: popObject.max });
                } else if(currentInfo !== undefined && currentInfo.INCREASE_MAX_PLAYERS_TO < popObject.max && !server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.ENABLED) {
                    popObject.max = currentInfo.INCREASE_MAX_PLAYERS_TO;
                    resolve({ commandNeeded: true, newPop: popObject.max });
                }
            
            }
            
           if(server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.ENABLED) {
                if(popObject.queue >= server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.QUEUE_COUNT_TO_INCREASE) {
                    const currentArray = [...server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.CONDITIONALS].reverse();
                    queueInfo = currentArray.find(theObj => theObj.POP_IS_GREATER_THAN < popObject.online);
                    if(queueInfo !== undefined && queueInfo.INCREASE_MAX_PLAYERS_TO > popObject.max && server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.DONT_CHANGE_POP_IF_FPS_IS_LESS_THAN < popObject.fps) {
                        popObject.max = queueInfo.INCREASE_MAX_PLAYERS_TO;
                        resolve({ commandNeeded: true, newPop: popObject.max });
                    }
            
                } else if(popObject.queue == 0) {
                    const queueChange = server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.CONDITIONALS.find(check => check.POP_IS_GREATER_THAN < popObject.online);
                    const currentArray = [...server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.BASIC.CONDITIONALS].reverse();
                    const popChange = currentArray.find(check => check.POP_IS_GREATER_THAN < popObject.online);
                    if(queueChange !== undefined && server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.QUEUEING.ENABLED && queueChange.INCREASE_MAX_PLAYERS_TO < popObject.max) {
                        popObject.max = queueChange.INCREASE_MAX_PLAYERS_TO;
                        resolve({ commandNeeded: true, newPop: popObject.max });
                    }
            
                    if(popChange !== undefined && server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.BASIC.ENABLED && popChange.INCREASE_MAX_PLAYERS_TO < popObject.max) {
                        popObject.max = popChange.INCREASE_MAX_PLAYERS_TO;
                        resolve({ commandNeeded: true, newPop: popObject.max });
                    } else if(popChange !== undefined && server.DYNAMIC_MAXPLAYERS_CHANGER.OPTIONS.BASIC.ENABLED && popChange.INCREASE_MAX_PLAYERS_TO > popObject.max) {
                        popObject.max = popChange.INCREASE_MAX_PLAYERS_TO;
                        resolve({ commandNeeded: true, newPop: popObject.max });
                    }
            
                }
            }
        } 
        resolve({ commandNeeded: false, newPop: "Done" });
    });
 
}

module.exports = popChanged;
