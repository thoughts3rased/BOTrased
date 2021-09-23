const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a coin.'),
    async execute(interaction) {
        if (Math.random() > 0.5){
            interaction.reply(`<:heads:809568187707817994>`)
            setTimeout(function(){
                interaction.channel.send("You got **heads**.")
            }, 50)
        } else {
            interaction.reply(`<:tails:809568669029236766>`)
            setTimeout(function(){
                interaction.channel.send("You got **tails**.")
            }, 50)
        };
    },
};