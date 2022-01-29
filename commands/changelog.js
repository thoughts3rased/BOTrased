const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination')
const fs = require('fs');
const readline = require('readline')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Check BOTrased\'s changelog.'),
    async execute(interaction) {
        var pages = []
        let embedBody
        let embedTitle
        let j
        fs.readdir('./changelogs/', (err, files)=> {
                for (var i = 0; i < files.length; i++){
                embedTitle = ''
                embedBody = ''
                const changelogFileStream = fs.createReadStream(`./changelogs/${files[i]}`);
                const rl = readline.createInterface({
                    input: changelogFileStream,
                    crlfDelay: Infinity
                });
                j = 0
                //this should split each file of the changelog onto its own line
                rl.on('line', (line) => {
                    if (j === 0){
                        //we want the first line to be the title of the embed, with the rest being in the embed's description
                        embedTitle = line
                        console.log(embedTitle)
                    } else{
                        embedBody += line + "\n"
                        console.log(embedBody + 1)
                    };
                    j++
                })
                //console.log(embedTitle, embedBody)
                const embed = new MessageEmbed()
                .setColor('DARK_PURPLE')
                .setTitle(embedTitle)
                .setDescription(embedBody)
                ;
                pages.push(embed)
        }})
        
        //console.log(pages)
        const buttonList = [
            new MessageButton()
                .setCustomId('previousbtn')
                .setLabel('Previous Changelog')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('nextbtn')
                .setLabel('Next Changelog')
                .setStyle('SUCCESS')
        ]
        
        paginationEmbed(interaction, pages, buttonList)    
    },
};