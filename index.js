require('dotenv').config()

const { Client } = require('discord.js')
const { Collection } = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const axios = require('axios')
const fs = require('fs')

const client = new Client({ intents: 3276799 })

// Command Handler

const commandFiles = fs
	.readdirSync('./C')
	.filter((file) => file.endsWith('.js'))
const commands = []
client.commands = new Collection()

for (let file of commandFiles) {
	let command = require(`./C/${file}`)
	commands.push(command.data.toJSON())
	client.commands.set(command.data.name, command)
	console.log(
		`\x1b[38;2;249;65;68m[Commands] \x1b[32m${command.data.name}\x1b[0m has been loaded.`
	)
}

///

client.on('ready', async () => {
	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)

	await rest.put(Routes.applicationCommands(process.env.ID), {
		body: commands,
	})
})

///

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand() && !interaction.isContextMenu()) return
	if (interaction.user.bot === true) return

	let command = client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction, client)
	} catch (error) {
		console.error(error)
		await interaction.reply({
			content: 'Ocorreu um erro ao executar este comando!',
			ephemeral: true,
		})
	}
})

///

client.on('messageCreate', async (message) => {
	if (message.author.bot) return
	if (message.channel.type === 'UNKNOWN') return

	/*   if (message.content.startsWith('<@989349457726418964>')) {
    message.reply({
      content: `opa! Quer saber meus comandos? Utilize \`/ajuda\``,
    });
  } */

	if (
		message.content.toLowerCase().startsWith('csgo caiu') ||
		message.content.toLowerCase().startsWith('cs caiu')
	) {
		var req = await axios
			.get(
				`https://api.steampowered.com/ICSGOServers_730/GetGameServersStatus/v1/?key=${process.env.KEY}`
			)
			.catch(function (error) {
				message.reply(
					'Não consigo acessar a WebAPI, tente novamente mais tarde.'
				)
			})
		var req2 = await axios
			.get(
				`https://api.steampowered.com/ICSGOServers_730/GetGameServersStatus/v1/?key=${process.env.KEY}`
			)
			.catch(function (error) {
				message.reply(
					'não consigo acessar a WebAPI no momento, tente novamente mais tarde.'
				)
			})

		await message.react('⁉️')
		let filter = (reaction, user) =>
			reaction.emoji.name === '⁉️' && user.id === message.author.id
		let collector = message.createReactionCollector({
			filter: filter,
			time: 300000,
		})
		collector.on('collect', (em) => {
			em.remove(message.author.id)
			em.remove(client.user.id)
			var dc = req.data.result.datacenters

			function te(lugar) {
				//tradução do ESTADO
				let estados = dc[lugar].load
				var traduz

				switch (estados) {
					case 'low':
						traduz = '`pouco tráfego`'
						break
					case 'medium':
						traduz = '`tráfego médio`'
						break
					case 'full':
						traduz = '`muito tráfego`'
						break
					case 'idle':
						traduz = '`inativo`'
						break
					default:
						traduz = estados
						break
				}
				return traduz
			}

			message
				.reply({
					content: `Os servidores do Brasil estão com ${te(
						'Brazil'
					)} e a sessão de logon está \`${
						req2.data.result.services.SessionsLogon
					}\`.`,
				})
				.then((msg) => {
					setTimeout(() => msg.delete(), 10000)
				})
		})
	}
})

///

client.login(process.env.TOKEN)
