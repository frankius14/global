const sqlite3 = require('sqlite3');
const fetch = require('node-fetch');
const Discord = require('discord.js');
let db = new sqlite3.Database('./src/database/serverLogs.sqlite3', (err) => {
  if (err) return console.log(err);
});

const wipeAnnouncement = (wipedObject, server) => {

  return new Promise((resolve, reject) => {

    if (!wipedObject.wipeDate) {
      reject("Error while receiving details...");
    }

    try {
      if (wipedObject.wipeDate) {
        let content = ` `;
        let embed = new Discord.EmbedBuilder();
        wipedObject.serverSeed = wipedObject.serverSeed.replace(/"/g, '');
        wipedObject.serverSize = wipedObject.serverSize.replace(/"/g, '');
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION.replace(/{seed}/g, wipedObject.serverSeed);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION.replace(/{size}/g, wipedObject.serverSize);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION.replace(/{SERVER_PORT}/g, server.SERVER_PORT);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION.replace(/{SERVER_IP}/g, server.SERVER_IP);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE.replace(/{seed}/g, wipedObject.serverSeed);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE.replace(/{SERVER_SHORTNAME}/g, server.SERVER_SHORTNAME);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE.replace(/{size}/g, wipedObject.serverSize);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER.replace(/{seed}/g, wipedObject.serverSeed);
        server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER.replace(/{size}/g, wipedObject.serverSize);
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION) embed.setDescription(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.DESCRIPTION)
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.EMBED_COLOR) embed.setColor(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.EMBED_COLOR)
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.SMALL_IMAGE) embed.setThumbnail(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.SMALL_IMAGE)
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE) embed.setTitle(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.TITLE)
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER) embed.setFooter({ text: server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.FOOTER })
        embed.setTimestamp();

        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.EXTERNAL_CONTENT) {
          content = server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.EXTERNAL_CONTENT;
        }
        console.log(wipedObject)
        if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.RUSTMAPS_API_KEY) {
          fetch(`https://api.rustmaps.com/v4/maps/${wipedObject.serverSize}/${wipedObject.serverSeed}?barren=false&staging=false`, { headers: { "X-API-Key": server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.RUSTMAPS_API_KEY } }).then(res => res.text()).then(response => {
            console.log(response)
            try {
              response = JSON.parse(response);
            } catch (err) {

            }
            if (!response) {
              if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.LARGE_IMAGE) embed.setImage(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.LARGE_IMAGE);
              const hook = new Discord.WebhookClient({ url: server.WIPE_ANNOUNCMENTS.WEBHOOK });
              hook.send({ embeds: [embed], content: content });
            } else {

              embed.setImage(response.data.imageIconUrl);

              const hook = new Discord.WebhookClient({ url: server.WIPE_ANNOUNCMENTS.WEBHOOK });
              hook.send({ embeds: [embed], content: content });
              wipedObject = { serverSeed: "", serverSize: "", wipeDate: "" };
            }
          });
        } else {
          if (server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.LARGE_IMAGE) embed.setImage(server.WIPE_ANNOUNCMENTS.EMBED_SETTINGS.LARGE_IMAGE.LARGE_IMAGE);
          const hook = new Discord.WebhookClient({ url: server.WIPE_ANNOUNCMENTS.WEBHOOK });
          hook.send({ embeds: [embed], content: content });
          wipedObject = { serverSeed: "", serverSize: "", wipeDate: "" };
        }
      }
    } catch (err) {
    }
  });

}

module.exports = wipeAnnouncement;
