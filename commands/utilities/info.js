const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("View information about BOTrased"),
	async execute(interaction) {
		const owner = await interaction.client.users.cache.get("273140563971145729")
		const embed = new EmbedBuilder()
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
        
		await interaction.editReply({embeds: [embed]})
		//note to future self: don't add ping or any other sort of diagnostic data. This should be in a status command of some sort.
	},
}