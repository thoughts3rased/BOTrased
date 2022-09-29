const { EmbedBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js")
const paginationEmbed = require("../../helpers/paginationEmbed")


module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Check BOTrased's leaderboards.")
		.addStringOption(option =>
			option.setName("category")
				.setRequired(true)
				.setDescription("The leaderboard you want to view.")
				.addChoices(
					{ name: "credits", value: "money" },
					{ name: "experience", value: "exp" }
				)),
	async execute(interaction) {
		await interaction.deferReply()
		//get the top 100 records from the database
		const leaderboardDataResult = await global.userRecords.findAll({order: [[interaction.options.getString("category"), "DESC"]]}, {limit: 100}).then((leaderboardData) => {return leaderboardData})
        
		//map these records into dicts in a new const
		const leaderboardData = leaderboardDataResult.map(result => result.dataValues)
        
		var leaderboardStringData = [] //used for holding the strings on each of the 10 max pages
        
		var leaderboardPageChunks = []//used for holding a split version of leaderboardStringData, in groups of 10 (or less)
        
		var pages = [] //array of EmbedBuilders, used for storing each page

		const titleDict = {"money": "credits", "exp": "experience"} //used for changing the title of the embeds based on the type of leaderboard requested by the user

		for (var i = 0; i < leaderboardData.length - 1 && i < 100; i++){
			// Fetch all users in the database
			let currentUser = await interaction.client.users.fetch(leaderboardData[i].userID)
			//push the formatted line to the leaderboardStringData array
			leaderboardStringData.push(`${i+1}. ${currentUser.username}#${currentUser.discriminator} - ${leaderboardData[i][interaction.options.getString("category")]}`)
		}
        
		//this loop splits the leaderboardStringData into an array of 10 arrays
		for (var i = 0; i < Math.ceil(leaderboardStringData.length / 10); i++){
			leaderboardPageChunks.push(leaderboardStringData.slice((i * 10), ((i + 1) * 10)))
		}
        
		//this formats each page, joining each of the page chunks into one string, split by line breaks
		for (var i=0; i < leaderboardPageChunks.length; i++){
			const embed = new EmbedBuilder()
				.setTitle(`Top ${leaderboardStringData.length} users by amount of ${titleDict[interaction.options.getString("category")]}`)
				.setDescription(`${leaderboardPageChunks[i].join("\n")}`)
			pages.push(embed)
		}
        
		//buttons to be passed through to the pagination module
		const buttonList = [
			new ButtonBuilder()
				.setCustomId("previousbtn")
				.setLabel("Previous Page")
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId("nextbtn")
				.setLabel("Next Page")
				.setStyle(ButtonStyle.Success)
		]
		paginationEmbed(interaction, pages, buttonList)

	},
}