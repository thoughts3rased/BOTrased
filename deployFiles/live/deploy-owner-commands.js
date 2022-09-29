const fs = require("fs")
const { REST, Routes } = require("discord.js")
const config = require("../../config.json")

const commands = []

const commandFiles = fs.readdirSync("./commands/owner").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command = require(`../../commands/owner/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("541373621873016866", "599730045480599562"),
			{ body: commands },
		)

		console.log("Successfully registered owner commands.")
	} catch (error) {
		console.error(error) 
	}
})()