const discord = require('discord.js')
const dotenv = require('dotenv')
const fetch = require('node-fetch')
const fs = require('fs');
const express = require('express')
const cors = require('cors')
const app = express()
const {
    readFileSync,
    writeFileSync
} = require('fs');

const port = 3000

// Hello
const TOKEN="MTA0OTczNzI5MjU4NTEyMzg2MA.GFNjpJ.vHyCWzqHnnFIkqxGjaW2N2tLvI0g4hOJms2zwY"
const GUILD_ID="1049352926365229116"
const ROLE_ID="1049353672628371496"

const GoogleSheets='https://script.google.com/macros/s/AKfycbyv1ctC4j1mL0Dc3XwRzcgIo_QvYnnFM15IFEc6DfiulGKX5RweIpIkT1RN2OWk_A41Lw/exec'
app.use(cors());


// 🌔 Express Routes
app.get("/", async function (req, res) {
    res.send("hi");
});


app.listen(port, (err) => {
    if (err) {
        console.log("❌Server crashed❌");
        console.log("--------------------");
        console.log(err)
    } else {
        console.log(`✅Server started successfully✅`);
        console.log(`http://localhost:${port}`);
    }
})


const guildID = '1049352926365229116'

dotenv.config()

const client = new discord.Client({
    intents: 515
})

const activities_list = [
    "/whitelist minecraft-username",
    "whitelisted user files",
    "Minecraft Database",
    "Localminer.me"
  ];

client.on('ready', () => {

    console.log(`The bot is ready as "${client.user.username}#${client.user.discriminator}"`)

    const guild = client.guilds.cache.get(guildID)

    if (!guild) {
        console.log(`Error! Main server not found! Please add this bot to the server and restart the bot.`)
    }

    let commands = guild.commands

    commands.create({
        name: 'whitelist',
        description: `Get Your Minecraft UserName Whitelisted And Get Role!`,
        options: [{
            type: discord.Constants.ApplicationCommandOptionTypes.STRING,
            name: 'minecraft-username',
            description: 'Insert your minecraft username here to get whitelisted.',
            required: true
        }]
    }).then(() => {
        console.log(`Command successfully created!`)
    })

    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
        client.user.setActivity(activities_list[index], { type: 'WATCHING' }); // sets bot's activities to one of the phrases in the arraylist.
    }, 10000); // Runs this every 10 seconds.

})

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isCommand()) return

    const {
        commandName,
        options
    } = interaction

    if (commandName === 'whitelist') {

        await interaction.deferReply({
            ephemeral: true,
        })

        const guild = client.guilds.cache.get(guildID)

        const user = guild.members.cache.get(interaction.user.id)

        const name = options.getString('minecraft-username')
        success();

        function sendSuc() {
            const verifySuccess = new discord.MessageEmbed({
                title: `✅ Username Whitelisted!`,
                description: `${guild.members.cache.get(interaction.user.id)} Your Username is Whitelisted  And We Have Added <@&${ROLE_ID}> role! To Your Account\n`+
                "> Username: `"+options.getString('minecraft-username')+"`",
                color: '#00FF00'
            })
            verifySuccess.setThumbnail(`https://minecraftpfp.com/api/pfp/${options.getString('minecraft-username')}.png`)
            interaction.editReply({
                embeds: [verifySuccess],
            }).then(() => {
                user.roles.add(ROLE_ID)
            })
        }

        function success() {
            fetch(`${GoogleSheets}`)
                .then(response =>{
                    if(!response.ok){
                        throw Error("ERROR");
                    }
                    return response.json();})
                .then(datas => {
                    // console.log(datas);
                    let findname = datas.find(elem => elem.username === name);
                    // console.log(findname);
                    let findid = datas.find(elem => elem.userid === user.id);
                    if (!findname && !findid) {
                        var data1 ={
                            "username": name,
                            "userid": user.id
                        }
                        fetch(`${GoogleSheets}?action=addUser`, {
                            method: 'POST',
                              body: JSON.stringify(data1)
                            }).then(res => sendSuc());
                        
                    } if (findname) {
                        const verifyFail1 = new discord.MessageEmbed({
                            title: `❌ Username Allready Whitelisted!`,
                            description: `**The User <@${findname.userid}> Has Already Whitelisted with**\n\n`+
                            "> Minecraft Username: `"+ options.getString('minecraft-username')+"`\n\n"+
                            "if think your account is compromised open <#972722437760380966> ticket!",
                            color: '#FF0000'
                        })
                        verifyFail1.setThumbnail(`https://minecraftpfp.com/api/pfp/${options.getString('minecraft-username')}.png`)
                        interaction.editReply({
                            embeds: [verifyFail1],
                        })
                    }
                
                })
            }
    }
})


client.login(TOKEN)