const { SlashCommandBuilder } = require("discord.js")
const fs = require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("8ball")
		.setDescription("Got a question you're unsure of? Ask the 8ball.")
        .addStringOption(option => 
            option
                .setName("question")
                .setDescription("The question you want to ask the 8ball.")
                .setRequired(true)),
	async execute(interaction) {
		const answers = fs.readFileSync("./assets/games/8ball/answers.txt").toString().split("\n")
        return await interaction.editReply(`:question: **${interaction.member.nickname ? interaction.member.nickname : interaction.member.user.username} asks**: ${interaction.options.getString("question")}\n\n:8ball: The 8 ball says: ${answers[Math.floor(Math.random() * answers.length)]}`)
	},
}