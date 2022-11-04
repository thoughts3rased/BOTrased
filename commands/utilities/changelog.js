const { EmbedBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js")
const paginationEmbed = require("../../helpers/paginationEmbed")
const fs = require("fs")
const readline = require("readline")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("changelog")
		.setDescription("Check BOTrased's changelog."),
	async execute(interaction) {
		var pages = []
		let embedBody
		let embedTitle
		const filenames = fs.readdirSync("./changelogs").reverse()  
		for(var i = 0; i < filenames.length; i++){
			embedTitle = ""
			embedBody = ""
			const changelogFileStream = fs.createReadStream(`./changelogs/${filenames[i]}`)
			const rl = readline.createInterface({
				input: changelogFileStream,
				crlfDelay: Infinity
			})
			var j = 0
			//this should split each file of the changelog onto its own line
			for await(const line of rl){
				if (j === 0){
					//we want the first line to be the title of the embed, with the rest being in the embed's description
					embedTitle = line
				} else{
					embedBody += line + "\n"
				}
				j++
			}
			var embed = new EmbedBuilder()
				.setColor("DARK_PURPLE")
				.setTitle(embedTitle)
				.setDescription(embedBody)
            
			pages.push(embed)
		}
        
		const buttonList = [
			new ButtonBuilder()
				.setCustomId("previousbtn")
				.setLabel("Previous Changelog")
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId("nextbtn")
				.setLabel("Next Changelog")
				.setStyle(ButtonStyle.Success)
		]
        
		paginationEmbed(interaction, pages, buttonList)    
	},
}