const sqlite3 = require('sqlite3');

const fetch = require('node-fetch');
const Discord = require('discord.js');

const onlineMessage = (server) => {
    
    return new Promise((resolve, reject) => {

        if(!server) {
            reject("Error while receiving details...");
        }

        try {
            const hook = new Discord.WebhookClient({ url: server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.WEBHOOK});
            let embed = new Discord.EmbedBuilder();
            let newMessage = server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS;
            newMessage.TITLE = newMessage.TITLE.replace(/{SERVER_SHORTNAME}/gi, server.SERVER_SHORTNAME);

            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.TITLE) embed.setTitle(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.TITLE);
            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.LARGE_IMAGE) embed.setImage(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.LARGE_IMAGE);
            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.SMALL_IMAGE) embed.setThumbnail(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.SMALL_IMAGE);
            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.DESCRIPTION) embed.setDescription(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.DESCRIPTION);
            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.FOOTER) embed.setFooter({ text: server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.FOOTER });
            if(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.COLOR) embed.setColor(server.SERVER_ONLINE_OFFLINE.ONLINE_EMBED_SETTINGS.COLOR);
            embed.setTimestamp();
            hook.send({ embeds: [embed] });

            resolve(embed);
        } catch(err) {
            console.log(err)
        }
    });
 
}

module.exports = onlineMessage;
