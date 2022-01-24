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
        fs.readdirSync('./changelogs').forEach(file => {
                console.log(file)
                var embedTitle = ''
                var embedBody = ''
                const changelogFileStream = fs.createReadStream(`./changelogs/${file}`);
                const rl = readline.createInterface({
                    input: changelogFileStream,
                    crlfDelay: Infinity
                });
                var i = 0
                //this should split each file of the changelog onto its own line
                rl.on('line', (line) => {
                    if (i === 0){
                        //we want the first line to be the title of the embed, with the rest being in the embed's description
                        embedTitle += line
                    } else{
                        embedBody += line + "\n"
                    };
                    i ++
                })
                rl.on('close', function () {
                    const embed = new MessageEmbed()
                    .setColor('DARK_PURPLE')
                    .setTitle(embedTitle)
                    .setDescription(embedBody)
                    ;
                    pages.push(embed)
                })
            })
        
        console.log(pages)
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