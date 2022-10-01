const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, Colors } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("serversettings")
		.setDescription("Modify various server settings.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand(subcommand =>
			subcommand
				.setName("levelupmessage")
				.setDescription("Toggle whether the level up message will display for users who have it turned on.")
				.addStringOption(option =>
					option
						.setName("state")
						.setDescription("The option for this setting.")
						.setRequired(true)
						.addChoices(
							{ name: "on", value: "1" },
							{ name: "off", value: "0" }
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("show")
				.setDescription("Show the current settings configuration for the server.")),
	async execute(interaction) {
		const serverRecord = await global.serverRecords.findOne({where: {serverID: interaction.guild.id}})
		const statuses = {1: "Enabled", 0: "Disabled"}
		switch(interaction.options.getSubcommand()){
		case "levelupmessage":
			await serverRecord.update({levelUpMessage: interaction.options.getString("state")}, {where: {serverID: `${interaction.guild.id}`}})
			await interaction.editReply(`Level up messages are now globally **${statuses[interaction.options.getString("state")].toUpperCase()}** for the server.`)
			break
		case "show":
			var embed = new EmbedBuilder()
				.setTitle(`Settings configuration for ${interaction.guild.name}`)
				.addFields({name: "Level Up Messages:", value: `${statuses[serverRecord.get("levelUpMessage")]}`})
				.setColor(Colors.Purple)
			await interaction.editReply({embeds: [embed]})
			break
		}
	},
}