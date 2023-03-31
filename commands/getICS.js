const { SlashCommandBuilder } = require('discord.js');
const { Client } = require('undici');
const ubs = require('uuid-by-string')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_calender_file')
		.setDescription('ICS Kalender Datei mit Schulaufgaben'),
	async execute(interaction) {
	  await interaction.deferReply();
	  
	  async function getTermine(plan) {
	    return new Promise((resolve, reject) => {
		const stundClient = new Client("https://api.schueler.schule-infoportal.de")
		sTime = Date.now()
		stundClient.request({
		    path: "/clagybam/api/" + "termine",
		    method: "GET",
		    headers: {
			cookie: "schuelerportal_session=eyJpdiI6Iitpb1NnL3I5bVNneTd0N3c4aGtubmc9PSIsInZhbHVlIjoibGZ3YSsxM21YVHU5THM3b1hCNUpIUEs0MFRXV1I4RWpDdG1ZVXdEQ0EzUExhcHJnOSsrMDhHNHZLNFFSVTJPOXpMeVZMUmI5ZHI2UG1CWWxTWlVwTXl5Y1dnZTVRakR1SlRVYkRmekpPYS9uczRienRwZFpubWFsMEhBSTdtSHIiLCJtYWMiOiJiZjI1Zjk5NzQyOTMyNGEyZGYzODJmY2VmOWM3OTU0MGZkMTQ2MjUwMDUwNzI0NzViZGE3M2I1Y2ZiN2U1NGNiIiwidGFnIjoiIn0%3D",
			origin: "https://schueler.schule-infoportal.de"
		    }
		}, async function (err, data) {
		    if (err) {
			return null
		    }
		    const {
			statusCode,
			headers,
			trailers,
			body
		    } = data

		    resolve(await data.body.json());
		});
	    })
	}
	
	  /*
	  const { file } = await catResult.body.json();
	  interaction.editReply({ files: [file] });
	  */
	const json = await getTermine();
	for (var schulaufgabe in json.leistungsnachweise.schulaufgaben) {
	  console.log(json.leistungsnachweise.schulaufgaben[schulaufgabe]);
	}
	action.editReply(json.leistungsnachweise.schulaufgaben[1]);
      }
};
