const Discord = require("discord.js");

const prefix = process.env.prefix

module.exports = {
    name: 'unban',
    description: 'Desbanir um usuário.',
    usage: "{id do usuário} <razão>",
    guildOnly: false,
    cooldown: 5,
    aliases: ["desbanir"],
    args: true,
    permission: "ADMINISTRATOR",
    async execute(message, args) {
        // message.delete()      

        try {
            let reason = ""
            user = args.shift()
            if (args[0]) {
                reason = args.join(" ")
            }
            user.replace("<@", "").replace(">", "").replace("!", "")
            message.guild.fetchBans().then(bans => {
                if (bans.size == 0) {
                    let embed = new Discord.MessageEmbed()//aki tu faz um embed d q não tem banimento no servidor ok pdp
                        .setTitle("Wanted Store | Administração")
                        .setColor("#0B0B0B")
                        .setDescription(" `❔`ﾠ**Não consegui encontrar o usuário: ** `" + args[0] + "`")
                        .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                    return message.channel.send(embed)
                }
                let bUser = bans.find(b => b.user.id == user)
                if (!bUser) {
                    let embed = new Discord.MessageEmbed()
                        .setTitle("Wanted Store | Administração")
                        .setColor("#0B0B0B")
                        .setDescription(" `❔`ﾠ**Não consegui encontrar o usuário: ** `" + args[0] + "`")
                        .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
                    return message.channel.send(embed)
                }
                message.guild.members.unban(bUser.user, reason)
                let embed = new Discord.MessageEmbed()
                    .setTitle("💢 Desbanimento Registrado | Administração 💢")
                    .setColor("#11f574")
                    .addField("👥 Usuário:", user, true)
                    .addField("🔖 Desbanido por:", "<@" + message.author.id + ">", true)
                    .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

                if (reason !== "") {
                    embed.addField("📝 **Motivo:**", reason)
                }
                message.channel.send(embed)
            })


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