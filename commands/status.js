const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

//Simple command sure, but I mostly keep this around to use as a nice copy/paste template.
//Should be noted that this may get replaced by some sort of status command later on down the line.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('View technical information about BOTrased.'),
    async execute(interaction) {
        const dbStatus = pass
        const embed = new MessageEmbed()
            .setTitle("Technical information about BOTrased")
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
                {name: "Ping", value: `${interacion.client.ws.ping}ms.`},
            );
    },
};