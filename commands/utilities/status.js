const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("status")
		.setDescription("View technical information about BOTrased."),
	async execute(interaction) {
		var dbStatus = ""
		await sequelize.authenticate().then(() => {
			dbStatus = true
		})
			.catch(err => {
				dbStatus = false
			})
		const connectionDict = {true: "Online", false: "Unavailable"}
		const embed = new MessageEmbed()
			.setTitle("Technical information about BOTrased")
			.setThumbnail(interaction.client.user.avatarURL())
			.addFields(
				{name: "Ping:", value: `${interaction.client.ws.ping}ms`},
				{name: "Database Status:", value: `${connectionDict[dbStatus]}`},
				{name: "Errors Encountered Since Boot:", value: `${errorCount}`}
			)
		await interaction.reply({embeds: [embed]})
	},
}