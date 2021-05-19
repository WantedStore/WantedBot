const fs = require('fs');
const Discord = require('discord.js');
require("dotenv").config()
const { createCanvas, loadImage, registerFont } = require("canvas");
const anchorme = require("anchorme").default;
const { Console } = require('console');
const db = require('quick.db');
const prefix = process.env.prefix
const token = process.env.token



let seta = process.env.emoteseta
let verificar = process.env.emoteverificar

const delay = ms => new Promise(res => setTimeout(res, ms));
const path = require("path")

let ticketMessage
var userTickets = new Map()

const { Client } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const verified = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//////////////////////////////////////////////////////
/////////          INICIAR O BOT             ////////
////////////////////////////////////////////////////
client.once('ready', async () => {
    const intents = new Discord.Intents(Discord.Intents.ALL);
    const discordClient = new Discord.Client({ ws: { intents } });
    const servidor = client.guilds.cache.get(process.env.servidor);

    console.log("Wanted Store | INICIADO COM SUCESSO!")

    let statuses = [
        { status: "stats01", activity: { name: "🚀 |  Wanted Store no topo!", type: "PLAYING" } },
        { status: "stats02", activity: { name: "📨 | https://discord.gg/wantedstore", type: "PLAYING" } },
        { status: "stats03", activity: { name: `👥 | Membros: ${servidor.memberCount}`, type: "PLAYING" } },
        { status: "stats04", activity: { name: `Nitro CLASSIC | Nitro GAMING ON!`, type: "PLAYING" } },
    ]
    let i = 0;
    setInterval(() => {
        let status = statuses[i];
        if (!status) {
            status = statuses[0];
            i = 0;
        }
        client.user.setPresence(status);
        i++;
    }, 5000);

    const Verificar = new Discord.MessageEmbed()
        .setTitle("Wanted Store | Verificação")
        .setColor("#073dcc")
        .setThumbnail("https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
        .setDescription(`${seta}  Bem-vindo á Wanted Store, antes de efetuar uma compra leia nossos <#821708862956634112> para evitar complicações.\n\n${seta}  Caso tenha alguma dúvida, ou queira fazer alguma compra entre em contato conosco abrindo um <#831981321316335616>.\n\n${seta}  Para se verificar na Wanted Store, é só reagir no Emoji ${verificar}.`)
        .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

    let verificacao = client.channels.cache.get(process.env.verificarchannel)
    const fetched2 = await verificacao.message.fetch({ limit: 99 });
    verificacao.bulkDelete(fetched2)

    let verificarmsg = await verificacao.send(Verificar)
    await verificarmsg.react("<a:LNverified:821511305764274216>")

    verificarmsgID = verificarmsg.id

});
/////////////////////////////////////////////////////

////////////////////////////////////////////////////////
/////////               Comandos                ////////
////////////////////////////////////////////////////////
client.on('message', async message => {
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.delete() && message.reply('**<:error:844255510844145715> | Não consigo executar esse comando na DM!**').then(message => message.delete({ timeout: 8000 }));
    }

    if (command.permission) {
        if (!message.member.hasPermission(command.permission)) {
            return message.delete() && message.reply('**<:error:844255510844145715> | Você não tem permissão!**').then(message => message.delete({ timeout: 8000 }));

        }
    }
    if (command.args && !args.length) {
        let embedrlp = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Comandos")
            .setColor("#b51111")
            .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

        if (command.usage) {
            embedrlp.addField(`\n<:error:844255510844145715> | O uso certo do comando seria: \`${prefix}${command.name} ${command.usage}\``, "** **")
        }

        return message.delete() && message.channel.send(embedrlp).then(message => message.delete({ timeout: 8000 }));
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.delete() && message.reply(`**<:relogio:844256626571345970> | Por favor espere \`${timeLeft.toFixed(1)}\` segundos para usar o comando \`${command.name}\`  ⏰**`).then(message => message.delete({ timeout: 8000 }));
        }
    } else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.delete() && message.reply('**<:error:844255510844145715> | Aconteceu um erro ao tentar executar este comando!**').then(message => message.delete({ timeout: 8000 }));
    }
});
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////
///////          Verificação             ///////
///////////////////////////////////////////////
const captcha = (n) => {
    const randomizar = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz0123456789'
    let text = ''
    for (var i = 0; i < n + 1; i++) text += randomizar.charAt(Math.floor(Math.random() * randomizar.length))
    return text;
}

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) { return; }
    if (reaction.message.id === verificarmsgID && reaction.emoji.id === process.env.emoteIDverificar) {
        let member = reaction.message.guild.members.cache.get(user.id)
        reaction.users.remove(member.id);
        const name = `✅・verifique┇${member.user.username}`
        const guild = client.guilds.cache.get(process.env.servidor);

        guild.channels.create(name, {
            type: 'text',
            permissionOverwrites: [
                {
                    allow: 'VIEW_CHANNEL',
                    id: member.id
                },
                {
                    deny: 'VIEW_CHANNEL',
                    id: guild.id
                },
            ]
        }).then(async ch => {
            userTickets.set(member.id, ch.id);
            if (member.user.bot || member.guild.id !== process.env.servidor) return
            const token = captcha(8)
            member.user.token = token
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Wanted Store | Sistema de Verificação');
            embed.setDescription(`🔖 | **Para verificar no servidor digite o código abaixo:**` + "```" + token + "```")
            embed.setFooter("Wanted Store | Você tem 3 minutos para responder!", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            embed.setColor("#0b5fde");
            let msg = await ch.send(embed);
            let delMsg = await ch.send(`<@${member.id}>`)
            setTimeout(() => {

                delMsg.delete();

            }, 10)
            setTimeout(() => {

                ch.delete();

            }, 120000)
        }).catch(err => console.error());
    }

})
/////////////////////////////////////////////

// client.on("message", async message => {
//     if (!message.content.startsWith(prefix) || message.author.bot) return;
//     if (message.guild.id !== process.env.servidor) return;

//     const args = message.content.slice(prefix.length).trim().split(/ +/);
//     const commandName = args.shift().toLowerCase();

//     if (commandName === "add-db") {
//         db.add('times.ticket', 332);

//         const timesTicket = db.get('times.ticket');
//         console.log(timesTicket)
//     }
// });

/////////////////////////////////////////////////
///////       Verificação 02             ///////
///////////////////////////////////////////////
const guild = client.guilds.cache.get(process.env.servidor);

const verifymsg = '{token}'

client.on('message', (message) => {
    if (message.author.bot || !message.author.token || message.channel.type !== `text`) return
    if (message.content !== (verifymsg.replace('{token}', message.author.token))) return

    const embedsucess = new Discord.MessageEmbed()
    embedsucess.setTitle('`☑️` | Você foi verificado com sucesso, aguarde!');
    message.channel.send(embedsucess)
    const verificado = message.member.roles.cache.some(role => role.name === "Verificação");

    setTimeout(() => {
        client.guilds.cache.get(process.env.servidor).member(message.author).roles.add(process.env.cargoVerificado)
        client.guilds.cache.get(process.env.servidor).member(message.author).roles.remove("834555917658882059")
        message.channel.delete();

    }, 3000)
})
//////////////////////////////////////////////////////

////////////////////////////////////////////////////
///////             Anúncios                ///////
//////////////////////////////////////////////////
function isHex(h) {
    var a = parseInt(h, 16);
    return (a.toString(16) === h.toLowerCase())
}

client.on("message", async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (message.guild.id !== process.env.servidor) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === "anuncio") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send({
            embed: {
                color: 16734039,
                description: "\`<:error:844255510844145715>\` │ **Você não tem permissão para executar este comando!**"
            }
        }).then(message => message.delete({ timeout: 20000 }));

        let timeLimit = 1000000
        let selected = {}

        let currentPage = 0
        let pages = [

            {
                title: "Wanted Store | Título",
                noKeyDescription: "\`📝\` **|** Escreva o **Título!**",
                hasKeyDescription: "\`📝\` **|** O Título do Anúncio: ",
                key: "title"
            },
            {
                title: "Wanted Store | Descrição",
                noKeyDescription: "\`🏷️\` **|** Escreva a descrição do Anúncio.",
                hasKeyDescription: "\`🏷️\` **|* Escreva a Descrição do Anúncio: ",
                key: "description"
            },
            {
                title: "Wanted Store | Thumbnail",
                noKeyDescription: "\`🎴\` **|** Mande a imagem da **Thu mbnail!**",
                hasKeyDescription: "\`🎴\` **|** A **Thumbnail** do **Anúncio**: ",
                key: "thumbnail",
                filter: m => (m.content.startsWith("http") || m.content.startsWith("https") || m.attachments.first()) && m.author.id === message.author.id
            },
            {
                title: "Wanted Store | Imagem",
                noKeyDescription: "\`🖼️\` **|** Mande a **Imagem!**",
                hasKeyDescription: "\`🖼️\` **|** A **Imagem** do **Anúncio**: ",
                key: "image",
                filter: m => (m.content.startsWith("http") || m.content.startsWith("https") || m.attachments.first()) && m.author.id === message.author.id
            },

        ]


        let startEmbed = new Discord.MessageEmbed()
            .setTitle(pages[currentPage].title)
            .setDescription(selected[pages[currentPage].key] ? pages[currentPage].hasKeyDescription + "\n" + selected[pages[currentPage].key] + "" : pages[currentPage].noKeyDescription)
            .setColor(selected.color ? selected.color : "#202225")

        let startMessage = await message.channel.send(startEmbed)

        let reactionFilter = (reaction, user) => (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️" || reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id

        let startReactionCollector = startMessage.createReactionCollector(reactionFilter, { time: timeLimit })

        let startMessageCollector = message.channel.createMessageCollector(pages[currentPage].filter ? pages[currentPage].filter : m => m.author.id === message.author.id, { time: timeLimit })

        startMessageCollector.on("collect", m => {



            if (m.attachments.first()) {
                selected[pages[currentPage].key] = m.attachments.first().url
            } else {
                selected[pages[currentPage].key] = m.content
            }
            let newEmbed = new Discord.MessageEmbed()
                .setTitle(pages[currentPage].title)
                .setDescription(selected[pages[currentPage].key] ? pages[currentPage].hasKeyDescription + "\n" + selected[pages[currentPage].key] + "" : pages[currentPage].noKeyDescription)
                .setColor(selected.color ? selected.color : "#202225")
            if (selected[pages[currentPage].key]) {
                switch (pages[currentPage].key) {
                    case "image":
                        newEmbed.setImage(selected[pages[currentPage].key])
                        break;
                    case "thumbnail":
                        newEmbed.setThumbma(selected[pages[currentPage].key])
                        break;
                }
            }
            startMessage.edit(newEmbed)
        })

        startReactionCollector.on("collect", async (reaction, user) => {
            try {
                reaction.users.remove(message.author)
            } catch (error) {
            }
            if (reaction.emoji.name === "◀️") {
                if (currentPage > 0) {
                    currentPage--;
                } else {
                    return currentPage = 0
                }
            } else if (reaction.emoji.name === "▶️") {
                if (currentPage < pages.length - 1) {
                    currentPage++;
                } else {
                    return currentPage = pages.length - 1
                }
            } else if (reaction.emoji.name === "❌") {
                if (selected[pages[currentPage].key]) {
                    delete selected[pages[currentPage].key]
                }
            }

            if (reaction.emoji.name === "✅") {
                startMessageCollector.stop()
                startReactionCollector.stop()

                await startMessage.delete()


                if (reaction.emoji.name === "✅") {
                    let channelEmbed = new Discord.MessageEmbed()
                        .addField(" ``❔`` Qual o canal que você quer mandar?", "** **")
                        .setColor(selected.color ? selected.color : "#202225")
                    let channelMessage = await message.channel.send(channelEmbed)
                    let channelFilter = m => m.mentions.channels.first() && m.author.id === message.author.id
                    let channelMessageCollector = message.channel.createMessageCollector(channelFilter, { time: timeLimit })

                    channelMessageCollector.on("collect", async m => {

                        let channelEmbed = new Discord.MessageEmbed()
                            .setColor("#073dcc")
                            .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                        for (let i in selected) {

                            let info = selected[i]

                            switch (i) {
                                case "title":
                                    channelEmbed.setTitle(info)
                                    break;
                                case "description":
                                    channelEmbed.setDescription(info)
                                    break;
                                case "image":
                                    channelEmbed.setImage(info)
                                    break;
                                case "thumbnail":
                                    channelEmbed.setThumbmail(info)
                                    break;

                            }

                        }

                        let sureMessage = await message.channel.send("> **Você tem certeza?** Esse é o **embed** reaja com `✅` para **mandar** e com `❌` para **cancelar!**")
                        let finalEmbedMessage = await message.channel.send(channelEmbed)
                        let finalReactionFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id
                        let finalEmbedReactionCollector = finalEmbedMessage.createReactionCollector(finalReactionFilter, { time: timeLimit, max: 1 })

                        finalEmbedReactionCollector.on("collect", (reaction, user) => {
                            channelMessageCollector.stop()
                            if (reaction.emoji.name === "✅") {
                                m.mentions.channels.first().send(channelEmbed)
                                finalEmbedMessage.delete()
                                sureMessage.delete()

                            } else {
                                channelMessageCollector.stop()

                                let cancelledEmbed = new Discord.MessageEmbed()
                                    .setTitle("Cancelado!")
                                message.channel.send(cancelledEmbed).then(message => message.delete({ timeout: 20000 }));
                            }
                        })
                        try {
                            await finalEmbedMessage.react("✅")
                            await finalEmbedMessage.react("❌")
                        } catch (error) {

                        }


                    })
                } else {
                    let channelEmbed = new Discord.MessageEmbed()
                        .addField(" ``<:channel:844258895920103424>`` | Qual o canal que você quer mandar?", "** **")
                        .setColor(selected.color ? selected.color : "#202225")
                    let channelMessage = await message.channel.send(channelEmbed)
                    let channelFilter = m => m.mentions.channels.first() && m.author.id === message.author.id
                    let channelMessageCollector = message.channel.createMessageCollector(channelFilter, { time: timeLimit })

                    channelMessageCollector.on("collect", async m => {
                        channelMessageCollector.stop()
                        let channelEmbed = new Discord.MessageEmbed()
                        for (let i in selected) {

                            let info = selected[i]

                            switch (i) {
                                case "title":
                                    channelEmbed.setTitle(info)
                                    break;
                                case "description":
                                    channelEmbed.setDescription(info)
                                    break;
                                case "image":
                                    channelEmbed.setImage(info)
                                    break;
                                case "thumbnail":
                                    channelEmbed.setThumbnail(info)
                                    break;
                            }

                        }
                        let sureMessage = await message.channel.send("> **Você tem certeza?** Esse é o **embed** reaja com `✅` para **mandar** e com `❌` para **cancelar!**")
                        let finalEmbedMessage = await message.channel.send(channelEmbed)
                        let finalReactionFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id
                        let finalEmbedReactionCollector = finalEmbedMessage.createReactionCollector(finalReactionFilter, { time: timeLimit, max: 1 })

                        finalEmbedReactionCollector.on("collect", (reaction, user) => {
                            if (reaction.emoji.name === "✅") {
                                m.mentions.channels.first().send(channelEmbed)
                                finalEmbedMessage.delete(

                                )
                                sureMessage.delete()

                            } else {
                                let cancelledEmbed = new Discord.MessageEmbed()
                                    .setTitle("Cancelado!")
                                message.channel.send(cancelledEmbed).then(message => message.delete({ timeout: 20000 }));
                            }
                        })
                        try {
                            await finalEmbedMessage.react("❌")
                            await finalEmbedMessage.react("✅")
                        } catch (err) {

                        }


                    })
                }

            } else {
                startMessageCollector.stop()

                let newEmbed = new Discord.MessageEmbed()
                    .setTitle(pages[currentPage].title)
                    .setDescription(selected[pages[currentPage].key] ? pages[currentPage].hasKeyDescription + "\n" + selected[pages[currentPage].key] + "" : pages[currentPage].noKeyDescription)
                    .setColor("#202225")
                if (selected[pages[currentPage].key]) {
                    switch (pages[currentPage].key) {
                        case "image":
                            newEmbed.setImage(selected[pages[currentPage].key])
                            break;
                        case "thumbnail":
                            newEmbed.setThumbnail(selected[pages[currentPage].key])
                            break;
                    }
                }
                await startMessage.edit(newEmbed)

                startMessageCollector = message.channel.createMessageCollector(pages[currentPage].filter ? pages[currentPage].filter : m => m.author.id === message.author.id, { time: timeLimit })

                startMessageCollector.on("collect", m => {
                    if (m.attachments.first()) {
                        selected[pages[currentPage].key] = m.attachments.first().url
                    } else {
                        selected[pages[currentPage].key] = m.content
                    }
                    let newEmbed = new Discord.MessageEmbed()
                        .setTitle(pages[currentPage].title)
                        .setDescription(selected[pages[currentPage].key] ? pages[currentPage].hasKeyDescription + "\n" + selected[pages[currentPage].key] + "" : pages[currentPage].noKeyDescription)
                        .setColor(selected.color ? selected.color : "#202225")
                    if (selected[pages[currentPage].key]) {
                        switch (pages[currentPage].key) {
                            case "image":
                                newEmbed.setImage(selected[pages[currentPage].key])
                                break;
                            case "thumbnail":
                                newEmbed.setThumbnail(selected[pages[currentPage].key])
                                break;
                        }
                    }
                    startMessage.edit(newEmbed)
                })

            }

        })

        try {

            await startMessage.react("◀️")
            await startMessage.react("▶️")
            await startMessage.react("❌")
            await startMessage.react("✅")
        } catch (error) {

        }
    }
});
////////////////////////////////////////////////

////////////////////////////////////////////////////
//////               Ticket                ////////
//////////////////////////////////////////////////
client.on('ready', async () => {

    const channel = client.guilds.cache.get(process.env.servidor).channels.cache.get(process.env.ticketchannelid)

    async function wipe() {
        var msg_size = 100;
        while (msg_size == 100) {
            await channel.bulkDelete(100)
                .then(messages => msg_size = messages.size)
                .catch(console.error);
        }
        console.log("Wanted Store | Sistema de Tickets --- MENSAGEM DELETADA")
    }
    await wipe()

    const embed = new Discord.MessageEmbed()
    embed.setTitle('Wanted Store | Ticket de Venda');
    embed.setDescription('**:ticket: | Para abrir um ticket reaja com <:LNticket:833072749311164508>!**');
    embed.setColor('#073dcc')
    embed.setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
    let msg = await channel.send(embed);
    await msg.react('<:LNticket:833072749311164508>');
    console.log('Wanted Store | Sistema de Tickets --- MENSAGEM REAGIDA')
    ticketMessage = msg 
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (!user.bot) {
        if (reaction.emoji.id === "833072749311164508" && reaction.message.id === ticketMessage.id) {
            await reaction.users.remove(user.id);
            if (userTickets.has(user.id) || reaction.message.guild.channels.cache.some(channel => channel.name.toLowerCase() === `📑・ticket┇${user.username}┇` + user.discriminator)) {
                const TicketAbrt = new Discord.MessageEmbed()
                    .addField("<:error:844255510844145715> | Você já tem um Ticket Aberto!", "** **")
                user.send(TicketAbrt);
            } else {

                let channels = reaction.message.guild.channels;
                let guild = reaction.message.guild;
                let vendedor = reaction.message.guild.roles.cache.get("826444483112599552");

                channels.create(`:ticket: | Ticket┇${user.username}┇${user.discriminator}`, {
                    type: 'text',
                    permissionOverwrites: [
                        {
                            allow: 'VIEW_CHANNEL',
                            id: user.id
                        },
                        {
                            allow: 'VIEW_CHANNEL',
                            id: vendedor.id
                        },
                        {
                            deny: 'VIEW_CHANNEL',
                            id: guild.id
                        }
                    ]
                }).then(async ch => {
                    userTickets.set(user.id, ch.id);
                    let embed = new Discord.MessageEmbed()
                    embed.setTitle('Wanted Store | Ticket de Venda');
                    embed.setDescription('<a:Aviso:828688850653544528>  | **Envie suas dúvidas, você será respondido em breve!**');
                    embed.addField("👤  Usuário:", `<@${user.id}>`, true)
                    embed.addField("🔖  Leia nossos termos:", `<#821708862956634112>`, true)
                    embed.('https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png')
                    embed.setColor('#073dcc');
                    let msg = await ch.send(embed);
                    await msg.react("🔒")
                    let delMsg = await ch.send(`<@${user.id}>`)
                    setTimeout(() => {

                        delMsg.delete();

                    }, 10)
                }).catch(err => console.log(err));
            }
        } else if (reaction.emoji.name === "🔒" && (userTickets.has(user.id) || reaction.message.guild.members.cache.get(user.id).hasPermission("ADMINISTRATOR")) || reaction.message.guild.channels.cache.some(channel => channel.name.toLowerCase() === `📑・ticket┇${user.username}┇` + user.discriminator)) {
            await reaction.message.reactions.cache.get('🔒').remove()
            const embedAvalicao = new Discord.MessageEmbed()
                .setDescription("**`✅` | Fechar ticket com avaliação**" + "\n**`❌` | Fechar ticket sem avaliação**")
                .setColor("#0B0B0B")
            let reactmsg = await reaction.message.channel.send(embedAvalicao);
            await reactmsg.react("✅")
            await reactmsg.react("❌")

        }
    }
})
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
//////            Ticket com Avaliação            ////////
///////////////////////////////////////////////////////////
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.emoji.name === '✅') {
        if (!reaction.message.channel.name.includes(`📑・ticket┇`)) return
        reaction.message.delete()
        const embedNumber = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Sistema de Avaliações")
            .setDescription("🚀 | **Dê uma avaliação de 0 á 5!**")
            .setFooter("Wanted Store - Você tem 25 segundos para responder!", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            .setColor("#0B0B0B")

        let msg = await reaction.message.channel.send(embedNumber)

        await msg.react("\u0031\u20E3");
        await msg.react("\u0032\u20E3");
        await msg.react("\u0033\u20E3");
        await msg.react("\u0034\u20E3");
        await msg.react("\u0035\u20E3");

        let filter = (reaction, user) => {
            return user.id === user.id;
        };

        let collector = msg.createReactionCollector(filter, { time: 25000, max: 1 })

        collector.on("collect", async (reaction, user) => {
            msg.delete()

            let embedMessage = new Discord.MessageEmbed()
                .setTitle("Wanted Store | Sistema de Avaliações")
                .setDescription("📝 | **Qual a mensagem que deseja enviar?**")
                .setColor("#0B0B0B")
                .setFooter("Wanted Store - Você tem 60 segundos para responder!", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

            let msg2 = await reaction.message.channel.send(embedMessage)

            let filter2 = m => m.author.id === user.id

            let channelCollector = msg2.channel.createMessageCollector(filter2, { time: 60000, max: 1 })
            let mensagem
            channelCollector.on("collect", m => {
                const canalavaliacoes = client.channels.cache.get(process.env.avaliacoeschannel)
                msg2.delete()
                m.delete()
                let embedfechar = new Discord.MessageEmbed()
                    .addField("⚠️ | Seu ticket será fechado em 5 segundos!", "** **")
                reaction.message.channel.send(embedfechar)
                setTimeout(() => {
                    userTickets.delete(reaction.message.channel.name.replace(`📑・ticket┇${user.username}┇`, ""))
                    userTickets.delete(user.id)
                    userTickets.delete(user.username)
                    reaction.message.channel.delete()
                    console.log("Wanted Store | Sistema de Tickets --- CANAL DELETADO")
                }, 5000);

                db.add('times.ticket', 1);

                const timesTicket = db.get('times.ticket');
                let embed = new Discord.MessageEmbed()
                    .setTitle("Wanted Store | Avaliação do Ticket")
                    .setColor("#073dcc")
                    .setDescription("💬╵**Mensagem:**" + "\n `" + m.content + "`" + "\n ⭐╵**Avaliação:**" + "\n **`" + reaction.emoji.name.charAt(0) + "/5`**" + "\n 🛒╵**Cliente:**" + "\n <@" + user.id + ">")
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setFooter(`Wanted Store - #${timesTicket} | ${user.username}#${user.discriminator}`, "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                canalavaliacoes.send(embed)
            })
        })
    }
})
////////////////////////////////////////////////////////

//////////////////////////////////////////////////////
////////            Fechar Ticket            ////////
////////////////////////////////////////////////////
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.emoji.name === '❌') {
        if (!reaction.message.channel.name.includes(`📑・ticket┇`)) return
        let embedfechar = new Discord.MessageEmbed()
            .addField("⚠️ | Seu ticket será fechado em 5 segundos!", "** **")
        reaction.message.channel.send(embedfechar)
        setTimeout(() => {
            userTickets.delete(reaction.message.channel.name.replace(`📑・ticket┇${user.username}┇`, ""))
            userTickets.delete(user.id)
            userTickets.delete(user.username)
            reaction.message.channel.delete()
            console.log("Wanted Store | Sistema de Tickets --- CANAL DELETADO")
        }, 5000);
    }
})
/////////////////////////////////////////////////////////

/////////////////////////////////
////////   LOGAR NO BOT ////////
///////////////////////////////
client.login(token);
/////////////////////////////