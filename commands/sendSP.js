const { SlashCommandBuilder } = require('discord.js');
const { getPreferences, getPlan, jsonToImg } = require('../requestToImg.js')

module.exports = {
	
	data: new SlashCommandBuilder()
		.setName('send_sp')
		.setDescription('Sendet den Stundenpan per Privatnachricht!'),
	async execute(interaction) {
		await interaction.deferReply();

		const allowedUFs = getPreferences(interaction.user.id);
		const stundJson = await getPlan("s");
		const vertretJson = await getPlan("v");

		const img = jsonToImg(allowedUFs, stundJson, vertretJson);

		interaction.editReply("Privat");
		interaction.user.send({ files: [img] });
	}
};
