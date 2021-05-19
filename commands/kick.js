const Discord = require("discord.js");
const { readdirSync } = require("fs");

const prefix = process.env.prefix


module.exports = {
    name: 'kick',
    description: 'Expulsar um usuário.',
    usage: "{usuário} <razão>",
    guildOnly: false,
    cooldown: 5,
    aliases: ["kickar"],
    args: true,
    permission: "ADMINISTRATOR",
    async execute(message, args) {
        let User = message.guild.members.cache.find(m => m.id === args[0].replace("<@", "").replace(">", "").replace("!", ""))
        if (!User) {
            let embed = new Discord.MessageEmbed()
                .setTitle("Wanted Store | Administração")
                .setColor("#0B0B0B")
                .setDescription(" `❔`ﾠ**Não consegui encontrar o usuário: **`" + args[0] + "`")
                .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            return message.channel.send(embed)
        }


        try {
            let reason = ""
            let user = args.shift()
            if (args[0]) {
                reason = args.join(" ")
            }

            await User.kick(reason)

            let embed = new Discord.MessageEmbed()
                .setTitle("🚫 Expulsão Registrada | Administração 🚫")
                .setColor("#7f0000")
                .setTimestamp()
                .addField("👥 Usuário:", user, true)
                .addField("🔖 Expulso por:", "<@" + message.author.id + ">", true)
                .setFooter("Wanted Store", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")



            if (reason !== "") {
                embed.addField("📝 Motivo:", reason)
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
