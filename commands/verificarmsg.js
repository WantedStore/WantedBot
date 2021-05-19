const Discord = require('discord.js');
const { Client, MessageEmbed } = require("discord.js")

let seta = process.env.emoteseta
let verificar = process.env.emoteverificar

let cor = '#0B0B0B'

module.exports = {
    name: 'verificarmsg',
    description: 'Mensagem padrão da Verificação!',
    usage: null,
    guildOnly: false,
    cooldown: 5,
    aliases: ["verifymsg"],
    args: false,
    permission: "ADMINISTRATOR",
    async execute(message, args) {

        const Embed = new Discord.MessageEmbed()
            .setTitle("Wanted Store | Verificação")
            .setColor("#073dcc")
            anail("https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")
            .setDescription(`${seta}  Bem-vindo á Wanted Store, antes de efetuar uma compra leia nossos <#821708862956634112> para evitar complicações.\n\n${seta}  Caso tenha alguma dúvida, ou queira fazer alguma compra entre em contato conosco abrindo um <#831981321316335616>.\n\n${seta}  Para se verificar na Wanted Store, é só reagir no Emoji ${verificar}.`)
            .setFooter("Wanted Store © Todos os direitos reservados.", "https://cdn.discordapp.com/attachments/831691809859567636/844341478452756490/Logotipo-Wanted-Store.png")

            let msg = await message.channel.send(Embed);
            await msg.react(`${verificar}`);
    }
}