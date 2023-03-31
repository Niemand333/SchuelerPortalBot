const { SlashCommandBuilder } = require('discord.js');
const { request } = require('undici');
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kurse_setzen')
		.setDescription('Setze deine Kurse')
		.addStringOption(option =>
		    option.setName('kurse')
			.setDescription('All deine Kurse (mit Komma getrennt)!')
			.setRequired(true)),
	async execute(interaction) {
	  await interaction.deferReply();
	  
	  const schueler = {id: interaction.user.id, kurse: interaction.options.getString("kurse").split(",")};
	  
	  let preferences = JSON.parse(fs.readFileSync("SchuelerConfigs.json", "utf8"))
	  
	  let inFile = -1;
	  for (const i in preferences)
	  {
	    if (preferences[i].id == schueler.id)
	    {
	      inFile = i;
	    }
	  }
	  
	  console.log(preferences.length);
	  
	  if (inFile == -1)
	  {
	    preferences.push(schueler);
	  }
	  else
	  {
	    preferences[inFile] = schueler;
	  }
	      
	  
	  let str = "";
	  str += schueler.id + ":\n";
	  for (const j in schueler.kurse)
	  {
	    kurs = schueler.kurse[j];
	    str += "  " + kurs + "\n";
	  }
	  
	  console.log(str);
	  
	  fs.writeFileSync("SchuelerConfigs.json", JSON.stringify(preferences));
	  
	  interaction.editReply("Fertig");
  }
};
