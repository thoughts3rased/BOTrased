const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const convertSecondsToHoursTimestamp = require("../../helpers/convertSecondsToHoursTimestamp")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("status")
		.setDescription("View technical information about BOTrased."),
	async execute(interaction) {
		var dbStatus = ""
		await sequelize.authenticate().then(() => {
			dbStatus = true
		})
			.catch(() => {
				dbStatus = false
			})
		const connectionDict = {true: "Online", false: "Unavailable"}
		const embed = new EmbedBuilder()
			.setTitle("Technical information about BOTrased")
			.setThumbnail(interaction.client.user.avatarURL())
			.addFields(
				{name: "Ping:", value: `${interaction.client.ws.ping}ms`},
				{name: "Database Status:", value: `${connectionDict[dbStatus]}`},
				{name: "Errors Encountered Since Boot:", value: `${errorCount}`},
				{name: "Current Uptime:", value: `${convertSecondsToHoursTimestamp(process.uptime())}`},
				{name: "Maintenance Mode:", value: `${maintenanceMode ? "Enabled" : "Disabled"}`}

			)
		await interaction.editReply({embeds: [embed]})
	},
}