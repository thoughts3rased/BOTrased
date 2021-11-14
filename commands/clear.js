const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a specific amount of messages in a specified channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of messages that the bot should clear.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('targetchannel')
                .setDescription('The channel that you want to clear messages in.')),
    async execute(interaction) {
        //Check if the user has the appropriate permissions to use the command
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
            return await interaction.reply({content: "You do not have the appropriate permission to use that command.", ephemeral: true})
        };
        //To determine what channel the bulk deletion should be targeted at, we should check to see if an argument has been passed
        let targetChannel;
        if (interaction.options.getChannel('targetchannel') == null){
            targetChannel = interaction.channel;
        } else {
            targetChannel = interaction.options.getChannel('targetchannel')
        }

        await interaction.deferReply().then(() => {
            targetChannel.messages.fetch({limit: interaction.options.getInteger('amount')}).then((messages) => {
                messages.forEach((message) => {
                    //We don't want the original interaction message deleting since that would cause an error, so we check for it during deletion
                    if (message.author.id != interaction.client.id && !message.interaction){
                        message.delete()
                    }
                })
                interaction.editReply(`Successfully deleted ${messages.size} messages.`)
            }).catch((e) => {
                console.log(e)
                interaction.editReply(`An error occurred during message deletion. Traceback:\n\`\`\`${e}\`\`\`\n(Please send this to the developer)`)
            }).then(() => {
                const newRecord = adminlogRecords.create({serverID: interaction.guild.id, recipientID: targetChannel.id, adminID: interaction.user.id, type: "clear", reason: null, time: Math.floor(Date.now() /1000), botUsed: true});
            }).catch((e) => {
                console.log(e)
                interaction.followUp({content: "There was an error recording this administrative action.", ephemeral: true})
            })
        })
    },
};