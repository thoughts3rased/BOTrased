const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, Permissions } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("serversettings")
		.setDescription("Modify various server settings.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("levelupmessage")
				.setDescription("Toggle whether the level up message will display for users who have it turned on.")
				.addStringOption(option =>
					option
						.setName("state")
						.setDescription("The option for this setting.")
						.setRequired(true)
						.addChoice("on", "1")
						.addChoice("off", "0")))
		.addSubcommand(subcommand =>
			subcommand
				.setName("show")
				.setDescription("Show the current settings configuration for the server.")),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)){
			await interaction.reply("You are not permitted to use this command group.")
			return
		}
		const serverRecord = await serverRecords.findOne({where: {serverID: interaction.guild.id}})
		const statuses = {1: "Enabled", 0: "Disabled"}
		switch(interaction.options.getSubcommand()){
		case "levelupmessage":
			const states = {"on": 1, "off": 0}
			await serverRecord.update({levelUpMessage: interaction.options.getString("state")}, {where: {serverID: `${interaction.guild.id}`}})
			await interaction.reply(`Level up messages are now globally **${statuses[interaction.options.getString("state")].toUpperCase()}** for the server.`)
			break
		case "show":
			var embed = new MessageEmbed()
				.setTitle(`Settings configuration for ${interaction.guild.name}`)
				.addFields({name: "Level Up Messages:", value: `${statuses[serverRecord.get("levelUpMessage")]}`})
			await interaction.reply({embeds: [embed]})
			break
		}
	},
}