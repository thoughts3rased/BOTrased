const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("flip")
		.setDescription("Flip a coin."),
	async execute(interaction) {
		if (Math.random() > 0.5){
			interaction.editReply("<:heads:809568187707817994>")
			//wait 50ms to ensure this message sends afterwards
			//will probably replace this with either a followup or an edit later on, this works for now
			setTimeout(function(){
				interaction.channel.send("You got **heads**.")
			}, 50)
		} else {
			interaction.editReply("<:tails:809568669029236766>")
			setTimeout(function(){
				interaction.channel.send("You got **tails**.")
			}, 50)
		}
	},
}