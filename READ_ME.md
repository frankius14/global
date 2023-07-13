# Thank you for purchasing #

# BEFORE YOU READ THE REST, IF YOU NEED HELP, JOIN MY SUPPORT DISCORD... https://discord.gg/RVePam7pd7 #


# Setup Guide #

There are differnet config files that you need to fille out.
There is a config.json file in the main container directory.
Then, in the SERVERS folder, you will see 2 default files. Those can be edited
however you'd like. If you like to, you can remove one of the servers, or you
can copy and paste them and add more.

If you get an error like " Cannot find node module blablabla " do the following
Windows: In your cmd prompt window run "npm i"
Linux: Same thing as windows
Panels: e.g. Pterodactly... Go to the start up tab and put in the following packages
"canvas chalk discord.js express fs moment node-fetch rustrcon sqlite3"

# --- IMPORTANT --- #
You must change the SERVER_SPECIAL_ID in each server config to something special
no two servers should get the same ID. 

HOW TO GET YOUR BOT TOKEN
- https://www.writebots.com/discord-bot-token/

INVITE THE BOT TO YOUR DISCORD WITH THE APPLICATION.COMMANDS SCOPE
- https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links

# There are 2 common solutions for bot hosting #
# Local hosting or VPS / Bot node hosting. #

# The site that I recommend for hosting is... #
  - https://pebblehost.com/
    > It gives you everything that you need for only $3 a month. 
    > It gives you 1024MB of RAM which is way more than enough RAM to run this bot.
    > 1 Free MySQL database
    > Automaic backups every 7 days
    > ETC*

  #  --- [ HOSTED SETUP ] ---  #

    - A host system that offers Node.js 16.6 and above is required
    - All you need to do is extract the files to the file manager section of your hosting
    - Fill out the config
    - Set the startup file to index.js (Most hosts have this set by default)

  #  --- [ LOCAL HOSTING SETUP ] ---  #

    - Fill out the configs
    - Make sure you have node installed. It must be version 16.6 and above.
    - Open a command prompt and do cd filePath 
    - Example, for me to get into my folder I'd do cd C:\Users\PC\Desktop\Rcon+
    - Then run node index.js