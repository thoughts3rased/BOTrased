const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, Colors } = require("discord.js")
const { reportError } = require("../../helpers/reportError")

const generateAutoRoleSettingDisplayString = serverRecord => {
	if (serverRecord.get("autoRoleId")) {
		return `<@&${serverRecord.get("autoRoleId")}>`
	}
	if (serverRecord.get("autoRoleEnabled")) {
		return ":warning: No autorole set, but the option is enabled. Please set a role for autorole."
	}

	return "No role set"
}

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
						))
		.addSubcommandGroup(subcommandgroup =>
			subcommandgroup
				.setName("autorole")
				.setDescription("Automatically adds a role to a user when they join.")
				.addSubcommand(subcommand => 
					subcommand
						.setName("enable")
						.setDescription("Turn autorole on or off")
						.addBooleanOption(option => 
							option
								.setName("enabled")
								.setDescription("Whether autorole is on or off")
								.setRequired(true)))
				.addSubcommand(subcommand => 
					subcommand
						.setName("setrole")
						.setDescription("Sets the role that will be added to new users.")
						.addRoleOption(option => 
							option
								.setName("targetrole")
								.setDescription("The role to apply to new users.")
								.setRequired(true)))),
	async execute(interaction) {
		const serverRecord = await global.serverRecords.findOne({where: {serverID: interaction.guild.id}})
		const statuses = {1: "Enabled", 0: "Disabled"}
		if (!interaction.options.getSubcommandGroup()){
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
							{name: "Lockdown Mode:", value: serverRecord.get("lockdownMode") === 1 ? "Enabled" : "Disabled"},
							{name: "Autorole State:", value: serverRecord.get("autoRoleEnabled") === 1 ? "Enabled" : "Disabled"},
							{name: "Autorole Role:", value: generateAutoRoleSettingDisplayString(serverRecord)}
						)
						.setColor(Colors.Purple)
					await interaction.editReply({embeds: [embed]})
					break
				case "lockdown":
					await serverRecord.update({lockdownMode: interaction.options.getBoolean("state") ? 1 : 0}, {where: {serverID: `${interaction.guild.id}`}})
					.then(async () => {
						await interaction.editReply(`Lockdown mode is now **${interaction.options.getBoolean("state") === true ? "ENABLED**. New users who join will now be automatically kicked." : "DISABLED**. Users can now join without being automatically kicked."}`)
					})
					break
			}
		}
		else {
			switch(interaction.options.getSubcommandGroup()){
				case "autorole":
					switch (interaction.options.getSubcommand()){
						case "enable":
							if (!serverRecord.get("autoRoleId")) return await interaction.editReply(":x: You can't enable autorole until you've set a role for it. Please set one with `/serversettings autorole role`.")
							
							await serverRecord.update({autoRoleEnabled: interaction.options.getBoolean("enabled") ? 1 : 0}, {where: {serverID: `${interaction.guild.id}`}})
							.catch(async error => {
								console.error(error)
								await reportError(errorStack = error.stack, )
								return await interaction.editReply(":x: An error occurred while saving your change.")
							})
							.then(async () => {
								return await interaction.editReply(`Autorole is now ${interaction.options.getBoolean("enabled") === true ? "**ENABLED**" : "**DISABLED**"}.`)
							})
							break
						case "setrole":
							await serverRecord.update({autoRoleId: interaction.options.getRole("targetrole").id}, {where: {serverID: `${interaction.guild.id}`}})
							.catch(async () => {
								return await interaction.editReply(":x: An error occurred while setting the autorole.")
							})
							.then(async () => {
								return await interaction.editReply(`New users will now be given the ${interaction.options.getRole("targetrole")} role.`)
							})
					}
					break
			}

		}
	},
}