

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const config = require("../../config.json")

const commands = []

const commandFiles = fs.readdirSync("./commands/owner").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command = require(`../../commands/owner/${file}`)
	try{
		commands.push(command.data.toJSON())
	}
	catch{
		console.warn(`Error deploying command at file: ./commands/owner/${file}`)
	}
}

const rest = new REST({ version: "9" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("803399539557400657", "599730045480599562"),
			{ body: commands },
		)

		console.log("Successfully registered owner commands.")
	} catch (error) {
		console.error(error) 
	}
})()