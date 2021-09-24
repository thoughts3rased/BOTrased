const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('View technical information about BOTrased.'),
    async execute(interaction) {
        let dbStatus
        await sequelize.authenticate().then(() => {
          this.dbStatus = true;
        })
        .catch(err => {
          this.dbStatus = false;
        });
        const connectionDict = {true: "Online", false: "Unavailable"}
        const embed = new MessageEmbed()
            .setTitle("Technical information about BOTrased")
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
                {name: "Ping", value: `${interacion.client.ws.ping}ms.`},
                {name: "Database Status:", value: connectionDict[dbStatus]}
            );
    },
};