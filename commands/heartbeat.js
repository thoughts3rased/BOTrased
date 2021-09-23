const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heartbeat')
        .setDescription('Check to see if the bot is responsive.'),
    async execute(interaction) {
        await interaction.reply("I'm alive!");
    },
};