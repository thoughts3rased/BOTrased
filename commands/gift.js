const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Gift credits to another user.')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of credits you\'d like to gift.')
                .setRequired(true))
        .addUserOption(option =>
            option
                .setName('recipient')
                .setDescription('The user who you\'d like to gift credits to.')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id === interaction.options.getUser('recipient').id){
            await interaction.reply("You cannot gift credits to yourself.")
            return
        };
        if (interaction.options.getInteger('amount') <= 0){
            await interaction.reply("You cannot gift less than a single credit.")
        }
        const author = await userRecords.findOne({where: {userID: interaction.user.id}})
        const recipient = await userRecords.findOne({where: {userID: interaction.options.getUser('recipient').id}})
        if (!recipient){
            await interaction.reply("Your selected recipient does not have a user profile.")
            return
        }
        if (!author){
            await interaction.reply("You do not have a user profile.")
            return
        }
        if (interaction.options.getInteger('amount') > author.get('money')){
            await interaction.reply("You do not have enough credits to gift this amount.")
            return
        }
        author.decrement('money', {by: interaction.options.getInteger('amount')}, {where: {userID: interaction.user.id}})
        recipient.increment('money', {by: interaction.options.getInteger('amount')}, {where: {userID: interaction.options.getUser('recipient').id}})
        await interaction.reply(`You have successfully gifted ${interaction.options.getInteger('amount')} credits to ${interaction.options.getUser('recipient')}.`);
    },
};