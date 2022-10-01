const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("id")
		.setDescription("Returns the ID of a specified user, or yours if none are specified.")
		.addUserOption(option => 
			option.setName("target")
				.setDescription("The target user.")    
				.setRequired(false)),
	async execute(interaction) {
		//has the user specified a target that is not themselves?
		if (await interaction.options.getMember("target") != null && await interaction.options.getMember("target").id != interaction.user.id){
			//if so, give them a 3rd person message
			await interaction.editReply(`<@${interaction.options.getMember("target").id}>'s user ID is ${await interaction.options.getMember("target").id}.`)
		} else{
			//otherwise, give them a 2nd person message
			await interaction.editReply(`Your user ID is ${interaction.user.id}.`)
		}
		//might add special case for asking for the bot's userID, but that's low priority.
		
	},
}