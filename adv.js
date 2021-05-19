const Discord = require("discord.js");
const { readdirSync } = require("fs");

const prefix = process.env.prefix

const warn1RoleId = "838018031007301663"
const warn2RoleId = "838018266906492949"
const warn3RoleId = "838018287006515280"


module.exports = {
    name: 'adv',
    description: 'Dar uma advertência em um usuário.',
    usage: "{usuário} <razão>",
    guildOnly: false,
    cooldown: 5,
    aliases: [ "advertencia"],
    args: true,
    permission: null,
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

        if (User.hasPermission('ADMINISTRATOR')) {
            let embedadm = new Discord.MessageEmbed()
                .setTitle("Wanted Store | Administração")
                .setColor("#0B0B0B")
                .setDescription(" `❕`ﾠ**Você não pode dar advertência em um administrador!**")
                .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            return message.channel.send(embedadm)
        }

        try {
            let advChannel = await message.client.channels.cache.get(process.env.advChannelID)


            let ban = false;
            let field = ""
            let field02 = ""
            let footer = process.env.normalFooter
            let reason = ""
            let user = args.shift()
            if (args[0]) {
                reason = args.join(" ")
            }
            let data
            let warn3 = User.roles.cache.find(role => role.id == warn3RoleId);
            let warn2 = User.roles.cache.find(role => role.id == warn2RoleId);
            let warn1 = User.roles.cache.find(role => role.id == warn1RoleId);
            if (warn2) {


                field02 ="**3/3** **__(Banido)__**"
                ban = true;

            } else if (warn1) {
                User.roles.add([warn2RoleId,warn1RoleId], reason)

                field02 = "**2/3**"

            } else {
                User.roles.add([warn1RoleId], reason)
                field02 = "**1/3**"

            }

            if(ban){

                User.ban({days:7,reason:"Banido por ultrapassar o limite de avisos!"})

            }

            let embed = new Discord.MessageEmbed()
            .setTitle("📛 Advertência Registrada | Administração 📛")
                .setColor("#7f0000")
                .addField("👥 Usuário: ", "<@" + User.id + ">", true)
                .addField("🔖 Advertido por: ", "<@" + message.author.id + ">", true)
                .addField("⚠️ Advertência:",field02, true) // n ta funfando? se liga
                .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")



            if (reason !== "") {
                embed.addField("📝 **Motivo:**", reason)
            }
            message.channel.send(embed)

        } catch (error) {
            let embed = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Administração")
            .setColor("#0B0B0B")
            .setDescription("❌  **Ocorreu um erro:** " + `\`${error}\``,"** **")
            .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            return message.channel.send(embed)
        }



    },
};
