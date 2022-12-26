
# Welcome to BOTrased's Repository!

Whether you're here to take a look, contribute or ended up here by accident, welcome!

# What is BOTrased?
BOTrased is a basic bot that aims to host a range of administrative tools, helpful utilities and a collection of text-based games. BOTrased is open-source, so you can browse, copy, modify and view the code however you like.

# Thinking of contributing?
Some guidelines for contributing:
- Pull requests are to be made to the production branch, not main
- If you're creating a command, make sure it fits with the "spirit" of the bot
- If you're fixing a bug, make sure to raise an issue for it first
- Code standards aren't particularly strict in this repo, however very sloppy code will be rejected

# Running BOTrased
To run BOTrased you will need NodeJS and NPM. If you do not know what these words mean, you probably shouldn't be trying to run the bot.

Make sure to install all required packages, and you'll need a MySQL server instance with SELECT, INSERT, ALTER, CREATE and DROP priveledges. Sequelize will automatically validate and create the tables on boot, so don't worry about having to create the correct tables.

Create a config.js file in the root of the working directory using the config-template.js as a base. You'll need a Discord bot token and MySQL credentials at the very least.

BOTrased supports PM2. Run BOTrased using PM2 using `pm2 run ecosystem.config.js` whilst in the working directory. After running this you can then refer to the process as BOTrased in commands.