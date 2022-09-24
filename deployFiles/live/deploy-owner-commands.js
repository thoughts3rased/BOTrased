

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const config = require("../../config.json")

const commands = []

const commandFiles = fs.readdirSync("./commands/owner").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command = require(`../../commands/owner/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("803399539557400657", "541373621873016866"),
			{ body: commands },
		)

		console.log("Successfully registered owner commands.")
	} catch (error) {
		console.error(error) 
	}
})()