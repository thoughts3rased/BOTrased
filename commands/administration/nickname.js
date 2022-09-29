const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nickname")
		.setDescription("Change a member's nickname.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
		.addUserOption(option =>
			option.setName("target")
				.setDescription("The user who's nickname you want to change.")
				.setRequired(true))
		.addStringOption(option =>
			option.setName("newnickname")
				.setDescription("The nickname you want to give to the user.")
				.setRequired(true)),
	async execute(interaction) {
		if (interaction.options.getString("newnickname").length > 32){
			return await interaction.reply("The nickname you have entered is too long.")
		}
		await interaction.deferReply().then(() => {
			interaction.options.getMember("target").setNickname(interaction.options.getString("newnickname"))
			interaction.editReply("Nickname changed successfully")
		}).catch((e) =>{
			console.error(e)
			interaction.editReply(`There was an error performing that action. Full traceback:\n\`\`\`${e}\`\`\``)
		}).then(() => {
			global.adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "name", reason: null, time: Math.floor(Date.now() /1000), botUsed: true})
		}).catch((e) =>{
			console.error(e)
			interaction.followUp("There was an issue recording the action in the database.")
		})
	},
}