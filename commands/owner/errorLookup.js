const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("errorlookup")
		.setDescription("Deliberately throw an error to check error handling")
        .addStringOption(option =>
            option.setName("errorcode")
            .setDescription("Look up an error code using an ID.")
            .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply()

        const errorResult = await global.errorTable.findByPk(interaction.options.getString("errorcode"))

        if (errorResult === null) return await interaction.editReply(":question: Error not found.")

        const errorAuthor = await interaction.client.users.fetch(errorResult?.dataValues?.commandAuthorId)

        const embed = new MessageEmbed()
                    .setTitle(`Error ${interaction.options.getString("errorcode")}`)
                    .setThumbnail("https://1001freedownloads.s3.amazonaws.com/vector/thumb/146499/molumen_red_round_error_warning_icon.png")
                    .setColor("#F91102")
                    .addFields(
                        {
                            name: "Occurred in command",
                            value: errorResult?.dataValues?.command || "Unknown command"
                        },
                        {
                            name: "Stack Trace",
                            value: `${"```"}${errorResult?.dataValues?.stackTrace}${"```"}`,
                            inline: false
                        },
                        {
                            name: "Command Invoked By",
                            value: errorAuthor ? `${errorAuthor.username}#${errorAuthor.discriminator} (ID: ${errorAuthor.id})` : "Invalid User",
                            inline: false
                        },
                        {
                            name: "Invoked in Server",
                            value: errorResult?.dataValues?.commandServerId || "Unknown Server",
                            inline: false
                        },
                        {
                            name: "Time of Error",
                            value: `<t:${errorResult.dataValues.time}:F>`,
                            inline: false
                        }
                    )

        await interaction.editReply({embeds: [embed]})
	},
}