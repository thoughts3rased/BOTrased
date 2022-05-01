const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, MessageButton } = require("discord.js")
const paginationEmbed = require("discordjs-button-pagination")
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
		console.log(filenames)   
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
			//console.log(embedTitle, embedBody)
			var embed = new MessageEmbed()
				.setColor("DARK_PURPLE")
				.setTitle(embedTitle)
				.setDescription(embedBody)
            
			pages.push(embed)
		}
        
		//console.log(pages)
		const buttonList = [
			new MessageButton()
				.setCustomId("previousbtn")
				.setLabel("Previous Changelog")
				.setStyle("DANGER"),
			new MessageButton()
				.setCustomId("nextbtn")
				.setLabel("Next Changelog")
				.setStyle("SUCCESS")
		]
        
		paginationEmbed(interaction, pages, buttonList)    
	},
}