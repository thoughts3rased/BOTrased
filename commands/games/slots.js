const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("slots")
		.setDescription("Gamble away your credits in a text-based slot machine.")
		.addIntegerOption(option =>
			option
				.setName("bet")
				.setDescription("The amount you want to wager")
				.setRequired(true)),
	async execute(interaction) {
		const user = await userRecords.findOne({where: {userID: interaction.user.id}})
		if (user.get("money") < interaction.options.getInteger("bet")){
			return await interaction.editReply(":x: You don't have enough credits to bet that amount.")
		} else if (interaction.options.getInteger("bet") < 0) {
			return await interaction.editReply(":x: You cannot bet an amount that is less than 0.")
		}
		await interaction.editReply(":question: :question: :question:")
		await userRecords.increment({money: 0 - interaction.options.getInteger("bet")}, {where: {userID: interaction.user.id}})
		const fruitTable = fruits = [":watermelon:", ":grapes:", ":grapes:",  ":banana:", ":banana:", ":banana:",  ":pineapple:", ":pineapple:", ":pineapple:", ":pineapple:",  ":cherries:", ":cherries:", ":cherries:", ":cherries:", ":cherries:"]
		const fruitRewardDict = {
			":watermelon:": 50,
			":grapes:": 15,
			":banana:": 8,
			":pineapple:": 6,
			":cherries:": 2
		}
		var result = []
		for (var i = 0; i < 3; i++){
			result.push(fruitTable[Math.floor(Math.random()*(fruitTable.length-1))])
		}
		await interaction.editReply(`${result[0]} :question: :question:`)
		setTimeout(async function(){
			await interaction.editReply(`${result[0]} ${result[1]} :question:`)
			setTimeout(async function(){
				await interaction.editReply(`${result[0]} ${result[1]} ${result[2]}`).then(async () =>{
					var payout = 0
					if (result[0] === result[1] && result[1] === result[2]){
						payout = interaction.options.getInteger("bet") * fruitRewardDict[result[0]]
						if (result[0] != ":watermelon:"){
							await interaction.followUp(`Congratulations, you've won ${payout} credits!`)
						} else {
							await interaction.followUp(`Hold on... Woah! Congratulations! You've hit the jackpot, meaning you've won 50 times the amount you bet! Enjoy your ${payout} credits!`)
						}
					} else if (result[0] === result[1]){
						payout = interaction.options.getInteger("bet")
						await interaction.followUp("You've won your money back by matching two fruits! How about trying your luck again?")
					} else {
						await interaction.followUp("Unfortunately you've lost this time, better luck next time!")
					}
					await userRecords.increment({money: payout}, {where: {userID: interaction.user.id}})
				})
			}, 500)
		}, 1000)
	},
}