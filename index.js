const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, GatewayIntentBits, Collection, Events, Guild } = require('discord.js');

dotenv.config({ path: './.env' });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();

const commandsPath = path.join(__dirname,'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
        client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, ()=>{
    console.log('Ready!!');
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch(error) {
        console.log(error);
        await interaction.followUp({ content: 'エラーが発生しました...', ephemeral: true});
    }
});

client.on('ready', () => {
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms | ${client.guilds.cache.size}サーバーに導入されています！`
        }, 5000)
    })
})

client.login(process.env.TOKEN);