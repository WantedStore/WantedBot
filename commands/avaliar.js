const Discord = require("discord.js");
const db = require('quick.db');
require("dotenv").config()
let seta = process.env.emoteseta
const prefix = process.env.prefix

module.exports = {
    name: 'avaliar',
    description: 'Avaliação para úsuario',
    usage: false,
    guildOnly: false,
    cooldown: 5,
    aliases: ["fb"],
    args: false,
    permission: undefined,
    async execute(message, args) {
        let tempmessage = message
        if (message.channel.id !== process.env.avaliacoeschannel) return;
        message.delete()
        let targetMember = message.mentions.members.first();

        let embed = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Sistema de Avaliação")
            .setColor("#0B0B0B")
            .setDescription("**O uso certo do comando seria:** " + "`!avaliar @vendedor`")
            .setFooter("Wanted Store - Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
        if (!targetMember) return message.channel.send(embed).then(message => message.delete({ timeout: 10000 }));

        const embedNumber = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Sistema de Avaliação")
            .setDescription("🚀  **Dê uma avaliação de 0 á 5!**")
            .setFooter("Wanted Store - Você tem 25 segundos para responder!", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            .setColor("#0B0B0B")

        let msg = await message.channel.send(embedNumber)

        await msg.react("\u0031\u20E3");
        await msg.react("\u0032\u20E3");
        await msg.react("\u0033\u20E3");
        await msg.react("\u0034\u20E3");
        await msg.react("\u0035\u20E3");
        try {
            setTimeout(() => msg.delete(), 25000);

          }
          catch(err) {
          
          }


        let filter = (reaction, user) => {
            return user.id === user.id;
        };

        let collector = msg.createReactionCollector(filter, { time: 25000, max: 1 })

        collector.on("collect", async (reaction, user) => {
            msg.delete()

            let embedMessage = new Discord.MessageEmbed()
                .setTitle("Wanted Store | Sistema de Avaliação")
                .setDescription("📝  **Qual a mensagem que deseja enviar?**")
                .setColor("#0B0B0B")
                .setFooter("Wanted Store - Você tem 60 segundos para responder!", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

            let msg2 = await message.channel.send(embedMessage)

            let filter2 = m => m.author.id === user.id

            let channelCollector = msg2.channel.createMessageCollector(filter2, { time: 60000, max: 1 })
            let mensagem

            try {
                setTimeout(() => msg2.delete(), 60000);
    
              }
              catch(err) {
              
              }

            channelCollector.on("collect", m => {
                msg2.delete()
                m.delete()

                db.add('times.ticket', 1);

                const timesTicket = db.get('times.ticket');
                let embed = new Discord.MessageEmbed()
                    .setTitle("Wanted Store | Avaliação")
                    .setColor("#073dcc")
                    .setDescription("\💬╵**Mensagem:**" + "\n `" + m.content + "`" + "\n \⭐╵**Avaliação:**" + "\n **`" + reaction.emoji.name.charAt(0) + "/5`**" + "\n \💸╵**Vendedor:**" + "\n <@" + targetMember.user.id + ">" + "\n \🛒╵**Cliente:**" + "\n <@" + user.id + ">")
                    anail(user.displayAvatarURL({ dynamic: true }))
                    .setFooter(`Wanted Store - #${timesTicket} | ${user.username}#${user.discriminator}`, "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                message.channel.send(embed)
                let embed02 = new Discord.MessageEmbed()
                    .setTitle("Wanted Store | Sistema de Avaliação")
                    .setColor("#073dcc")
                    .setDescription(seta + " **Para fazer uma avaliação digite:** `!avaliar @Vendedor`")
                    .setFooter(`Wanted Store - Todos os direitos reservados.`, "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                message.channel.send(embed02)
            })

        })

    }

}