const { TOKEN, CLIENT_ID, GUILD_ID, CHANNEL_ID } = require('./config.json');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('cron');

const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


const rest = new REST({ version: '10' }).setToken(TOKEN);



for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	commands.push(command.data.toJSON());
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();



client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  //console.log(interaction);
  
  if (!interaction.isChatInputCommand()) return;
  if (CHANNEL_ID == "" || interaction.channel != CHANNEL_ID) return;
  
  const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


function sendDailySP()
{
	const { getPreferences, getPlan, jsonToImg } = require('./requestToImg.js');
	let preferences = JSON.parse(fs.readFileSync("CronConfigs.json", "utf8"));

	for (let i in preferences)
	{
		if (preferences[i].hour == new Date().getHours())
		{
			(async () => {
				const allowedUFs = getPreferences(preferences[i].id);
				const stundJson = await getPlan("s");
				const vertretJson = await getPlan("v");
		
				const img = jsonToImg(allowedUFs, stundJson, vertretJson);
	
				client.users.send(preferences[i].id, { files: [img] });
		  	})()
		}
	}
}

client.login(TOKEN);

let hourly = new cron.CronJob('0 0 * * * 1-5', sendDailySP);
hourly.start();