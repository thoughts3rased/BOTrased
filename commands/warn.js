const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user with a message in DMs.'),
    async execute(interaction) {
        await interaction.reply("placeholder");
    },
};