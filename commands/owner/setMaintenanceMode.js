const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("maintenancemode")
		.setDescription("Turn maintenance mode on or off")
        .addStringOption(option =>
            option.setName("state")
            .setDescription("Maintenance mode's state")
            .addChoices(
                { name: "on", value: "true" },
                { name: "off", value: "false" }
            )),
	async execute(interaction) {
		global.maintenanceMode = interaction.options.getString("state") == "true"

        await interaction.reply(`Maintenance mode is now **${global.maintenanceMode ? "enabled" : "disabled"}**`)
	}
}