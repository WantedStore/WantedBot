const Discord = require("discord.js");

const prefix = process.env.prefix

module.exports = {
    name: 'ban',
    description: 'Banir um usuário.',
    usage: "{usuário} <razão>",
    guildOnly: false,
    cooldown: 5,
    aliases: ["banir"],
    args: true,
    permission: "ADMINISTRATOR",
    async execute(message, args) {
        // message.delete()
        let User = message.guild.members.cache.find(m => m.id === args[0].replace("<@", "").replace(">", "").replace("!", ""))
        if (!User) {
            let embed = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Administração")
                .setColor("#0B0B0B")
                .setDescription(" `❔`ﾠ**O usuário** `" + args[0] + "` **está no servidor?**")
                .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            return message.channel.send(embed)
        }


        try {
            let footer = process.env.normalFooter
            let options = {}
            let user = args.shift()
            if (args[1]) {
                options.reason = args.join(" ")
            }
            options.days = 7

            await User.ban(options)

            let embed = new Discord.MessageEmbed()
                .setTitle("⛔ Banimento Registrado | Administração ⛔")
                .setColor("#7f0000")
                .setTimestamp()
                .addField("👥 Usuário:", user, true)
                .addField("🔖 Banido por:", "<@" + message.author.id + ">",true)
                .setFooter("Wanted Store", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

            if (options.reason) {
                embed.addField("📝 Motivo:", options.reason)
            }
            message.channel.send(embed)

        } catch (error) {
            let embed = new Discord.MessageEmbed()
                .setTitle("Wanted Store | Administração")
                .setColor("#0B0B0B")
                .setDescription("❌  **Ocorreu um erro:** " + `\`${error}\``, "** **")
                .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            return message.channel.send(embed)
        }



    },
};
