require("./.pnp.cjs").setup()

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")

const commands = []

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("803399539557400657", "358708716599508993"),
			{ body: commands },
		)

		console.log("Successfully registered application commands.")
	} catch (error) {
		console.error(error)
	}
})()