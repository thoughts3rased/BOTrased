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
				.setDescription("Show the current settings configuration for the server."))
		.addSubcommand(subcommand => 
			subcommand
				.setName("lockdown")
				.setDescription("Locks down the server by immediately kicking all new members that join. Use with caution.")
				.addBooleanOption(option => 
					option
						.setName("state")
						.setDescription("The state of lockdown mode.")
						.setRequired(true)
						)),
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
				.setThumbnail(interaction.guild.iconURL())
				.addFields(
					{name: "Level Up Messages:", value: `${statuses[serverRecord.get("levelUpMessage")]}`},
					{name: "Lockdown Mode:", value: serverRecord.get("lockdownMode") === 1 ? "Enabled" : "Disabled"}
				)
				.setColor(Colors.Purple)
			await interaction.editReply({embeds: [embed]})
			break
		case "lockdown":
			await serverRecord.update({lockdownMode: interaction.options.getBoolean("state") ? 1 : 0}, {where: {serverID: `${interaction.guild.id}`}})
			.then(async () => {
				await interaction.editReply(`Lockdown mode is now **${interaction.options.getBoolean("state") === true ? "ENABLED**. New users who join will now be automatically kicked." : "DISABLED**. Users can now join without being automatically kicked."}`)
			})
		}
	},
}