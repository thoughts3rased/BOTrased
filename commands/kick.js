const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user and sends a message in DMs. Requires "Kick Members" permission.')
        .addUserOption(option =>
            option
            .setName("target")
            .setDescription("The user who you want to kick.")
            .setRequired(true))
        .addStringOption(option =>
            option
            .setName("reason")
            .setDescription("The reason for kicking this user.")
            .setRequired(false)),
    async execute(interaction) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS, true)){
            return await interaction.reply("You do not have the appropriate permissions to use this command.");
        };
        if(interaction.user.id == interaction.options.getUser('target').id){
            return await interaction.reply("You cannot kick yourself.");
        };
        if(interaction.client.user.id == interaction.options.getUser('target').id){
            return await interaction.reply("I can't kick myself, however if you'd like me to leave, kick me manually.");
        };
        await interaction.deferReply();
        let reason;
        if (!interaction.options.getString("reason")){
            reason = "No reason given.";
        } else {
            reason = interaction.options.getString("reason");
        };
        const embed = new MessageEmbed()
                        .setColor("ORANGE")
                        .setTitle(`You have been kicked from ${interaction.guild.name}!`)
                        .setThumbnail("https://i.imgur.com/XpWbrhp.png")
                        .addFields(
                            {name: "Reason:", value: reason},
                            {name: "Warned by:", value: `${interaction.user.username}#${interaction.user.discriminator}`}
                        );
        await interaction.options.getMember('target').createDM()
                        .then((DMChannel) => {
                            let kickMessage = DMChannel.send({embeds: [embed]}).then(() => {
                                interaction.editReply("Kick message sent successfully.")
                            })    
                        .catch((e) => {
                            interaction.editReply("There was an issue sending this user their kick message.")
                        })
                            .then(() => {
                                interaction.options.getMember('target').kick().then(() => {
                                    interaction.followUp("Kick performed successfully.")
                                })
                                .catch((e) => {
                                    interaction.followUp("There was an issue while trying to kick this user.")
                                    kickMessage.delete()
                                    console.log(e.stack)
                                })
                            })
                        })
        try{
            const newRecord = adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser('target').id, adminID: interaction.user.id, type: "warn", reason: interaction.options.getString('reason'), time: Math.floor(Date.now() /1000), botUsed: true});
            await interaction.followUp(`Kick entry created.`);
        } catch(error){
            console.log(error.stack)
            await interaction.followUp(`Error creating log entry. Case not recorded.`);
        };
    }
};