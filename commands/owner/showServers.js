const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("showservers")
		.setDescription("Show names of all servers that BOTrased is in"),
	async execute(interaction) {
		var serverText = ""
        await interaction.client.guilds.fetch()
        .then(async (servers) => {
            servers.forEach(async server => {
                serverText += `${server.name} - ${server.members.count} users\n`
            })
            const embed = new EmbedBuilder()
            .setTitle("BOTrased's servers")
            .setDescription(serverText)

            await interaction.editReply({embeds: [embed]})
        })
	},
}