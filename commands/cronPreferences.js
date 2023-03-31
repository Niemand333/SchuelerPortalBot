const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Schalte tägliche Stundenpläne an/aus')
        .addIntegerOption(option =>
            option.setName('hour')
                .setDescription('Wann sendet der Bot?')
                .setRequired(true)
                .addChoices(
                    { name: '1', value: 1 },
                    { name: '2', value: 2 },
                    { name: '3', value: 3 },
                    { name: '4', value: 4 },
                    { name: '5', value: 5 },
                    { name: '6', value: 6 },
                    { name: '7', value: 7 },
                    { name: '8', value: 8 },
                    { name: '9', value: 9 },
                    { name: '10', value: 10 },
                    { name: '11', value: 11 },
                    { name: '12', value: 12 },
                    { name: '13', value: 13 },
                    { name: '14', value: 14 },
                    { name: '15', value: 15 },
                    { name: '16', value: 16 },
                    { name: '17', value: 17 },
                    { name: '18', value: 18 },
                    { name: '19', value: 19 },
                    { name: '20', value: 20 },
                    { name: '21', value: 21 },
                    { name: '22', value: 22 },
                    { name: '23', value: 23 },
                    { name: '24', value: 24 },
                )),
    async execute(interaction) {
        await interaction.deferReply();

        let preferences = JSON.parse(fs.readFileSync("CronConfigs.json", "utf8"));

        let inFile = -1;

        for (let i in preferences) {
            if (preferences[i].id == interaction.user.id) {
                inFile = i;
                break;
            }
        }

        if (inFile >= 0) {
            preferences.splice(inFile, 1);
            interaction.editReply("Täglicher Stundenplan deaktiviert");
        }
        else {
            preferences.push({ id : (interaction.user.id), hour : (interaction.options.getInteger('hour')) });
            
            interaction.editReply("Täglicher Stundenplan aktiviert");
        }

        console.log(preferences);
        fs.writeFileSync("CronConfigs.json", JSON.stringify(preferences));
    }
};
