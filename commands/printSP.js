const { SlashCommandBuilder } = require('discord.js');
const { getPreferences, getPlan, jsonToImg } = require('../requestToImg.js')

module.exports = {
	
	data: new SlashCommandBuilder()
		.setName('print_sp')
		.setDescription('Gibt den Stundenpan aus!'),
	async execute(interaction) {
		await interaction.deferReply();

		const allowedUFs = getPreferences(interaction.user.id);
		const stundJson = await getPlan("s");
		const vertretJson = await getPlan("v");

		const img = jsonToImg(allowedUFs, stundJson, vertretJson);

		interaction.editReply({ files: [img] });
	}
};
