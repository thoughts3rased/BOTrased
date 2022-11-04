const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js")
const paginationEmbed = require("../../helpers/paginationEmbed")
const convertSecondsToHoursTimestamp = require("../../helpers/convertSecondsToHoursTimestamp")
const { version } = require("../../package.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("View information about BOTrased"),
	async execute(interaction) {
		pages = []
		const owner = await interaction.client.users.cache.get("273140563971145729")
		let dbStatus
		await sequelize.authenticate().then(() => {
			dbStatus = true
		})
			.catch(() => {
				dbStatus = false
			})
		const connectionDict = {true: "Online", false: "Unavailable"}
		pages.push(new EmbedBuilder()
			.setColor(Colors.DarkPurple)
			.setTitle(interaction.client.user.username)
			.setDescription("A Discord Bot written entirely in JavaScript.")
			.setThumbnail(interaction.client.user.avatarURL())
			.setImage(owner.displayAvatarURL())
			.addFields(
				{name: "Currently serving:", value: `${interaction.client.guilds.cache.size} servers`, inline: false},
				{name: "Invite me!", value: "[Invite link](https://discord.com/oauth2/authorize?client_id=541373621873016866&scope=bot&permissions=439610486)"},
				{name: "Support Server", value: "[Server Invite](https://discord.gg/KUSWws6XAA)"},
				{name: "Vote for BOTrased", value: "[Top.gg](https://top.gg/bot/541373621873016866/vote)"},
				{name: "Creator and Maintainer", value: `${owner.username}#${owner.discriminator}`}
			)
		)
		pages.push(
			new EmbedBuilder()
			.setTitle("Technical information about BOTrased")
			.setThumbnail(interaction.client.user.avatarURL())
			.addFields(
				{name: "Version:", value: version},
				{name: "Ping:", value: `${interaction.client.ws.ping}ms`},
				{name: "Database Status:", value: `${connectionDict[dbStatus]}`},
				{name: "Errors Encountered Since Boot:", value: `${errorCount}`},
				{name: "Current Uptime:", value: `${convertSecondsToHoursTimestamp(process.uptime())}`},
				{name: "Maintenance Mode:", value: `${maintenanceMode ? "Enabled" : "Disabled"}`}
			)
		)
        
		paginationEmbed(interaction, pages)
	},
}