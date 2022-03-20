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
        if (interaction.user.id === interaction.options.getUser('recipient').id){ //make sure that the user hasn't set themselves as a target
            return await interaction.reply("You cannot gift credits to yourself.")
        };
        if (interaction.options.getInteger('amount') <= 0){ //make sure that the user hasn't set a gift amount below zero
            return await interaction.reply("You cannot gift less than a single credit.")
        }
        //get the user records of both the interaction author and the recipient
        const author = await userRecords.findOne({where: {userID: interaction.user.id}})
        const recipient = await userRecords.findOne({where: {userID: interaction.options.getUser('recipient').id}})
        
        //check if both the author and recipient have user records in the database
        if (!recipient){
            await interaction.reply("Your selected recipient does not have a user profile.")
            return
        }
        if (!author){
            await interaction.reply("You do not have a user profile.")
            return
        }
        
        if (interaction.options.getInteger('amount') > author.get('money')){ //check to see if the user has enough money to gift
            await interaction.reply("You do not have enough credits to gift this amount.")
            return
        }

        //take money from the author, give it to the recipient
        author.decrement('money', {by: interaction.options.getInteger('amount')}, {where: {userID: interaction.user.id}})
        recipient.increment('money', {by: interaction.options.getInteger('amount')}, {where: {userID: interaction.options.getUser('recipient').id}})
        
        //reply with confirmation message
        await interaction.reply(`You have successfully gifted ${interaction.options.getInteger('amount')} credits to ${interaction.options.getUser('recipient')}.`);
    },
};