const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const readline = require('readline')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Check BOTrased\'s changelog.'),
    async execute(interaction) {
        let embedTitle
        let embedBody = ''
        const changelogFileStream = fs.createReadStream('./changelog.txt');
        const rl = readline.createInterface({
            input: changelogFileStream,
            crlfDelay: Infinity
        });
        var i = 0
        for await (const line of rl){
            if (i === 0){
                embedTitle = line
            } else{
                embedBody += line + "\n"
            };
            i ++
        };
        const embed = new MessageEmbed()
            .setColor('DARK_PURPLE')
            .setTitle(embedTitle)
            .setFooter('Note: "Silent Changes" are changes that should not impact user experience, and instead only code stability or maintainability.')
            .setDescription(embedBody)
        ;
        await interaction.reply({embeds: [embed]})
    },
};