const Command = require('../../base/Command.js');

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: ' ',
      description: ' ',
      usage: prefix => '`' + prefix + '`',
      examples: prefix => '`' + prefix + '`',
      enabled: true,
      ownerOnly: false,
      guildOnly: true,
      nsfwOnly: false,
      cooldown: 5000,
      aliases: [],
      memberPermissions: [],
      botPermissions: [],
      dirname: __dirname
    });
  }
  async run(message, args, data, embed) {
    try {
      let member, members;
      if (!args[0]) {
        embed
          .setColor(message.colors.red)
          .setTitle(message.defaults.noargs)
          .setDescription('Debes mencionar a alguien más');
        return message.channel.send({ embed });
      } else {
        member = message.mentions.members.first();
        if (member === message.member) {
          embed
            .setColor(message.colors.red)
            .setTitle(message.defaults.error)
            .setDescription('Debes mencionar a alguien más');
          return message.channel.send({ embed });
        } else {
          return await o(member);
        }
        members = message.guild.members.array().filter(m => m !== message.member && `${m.nickname ? `${m.nickname + m.user.tag}` : `${m.displayName + m.user.tag}`}`.toLowerCase().includes(args.join(' ').toLowerCase()));
        if (members.length < 1) {
          embed
            .setColor(message.colors.red)
            .setTitle(message.defaults.error)
            .setDescription('No hay ningún miembro que coincida con tu búsqueda, ¡intenta ser más específico!');
          return message.channel.send({ embed });
        } else if (members.length === 1) {
          return await o(members[0]);
        } else if (members.length >= 10) {
          embed
            .setColor(message.colors.red)
            .setTitle(message.defaults.error)
            .setDescription('Muchos usuarios coinciden con tu búsqueda, ¡intenta ser más específico!');
          return message.channel.send({ embed });
        } else {
          let length = members.length > 9 ? 10 : members.length,
            text = 'Selecciona un número entre 1 y ' + length + '```js\n';
          for (let i = 0; i < length; i++) {
            text += `${i + 1} - ${members[i].displayName}: (${members[i].user.tag}),\n`;
          }
          let textS = text.split(',');
          textS.pop();
          embed
            .setColor(message.colors.gray)
            .setTitle(message.defaults.grayun + 'Esperando respuesta...')
            .setDescription(textS.join(',') + '```');
          let msg = await message.channel.send({ embed });
          let index = await message.channel.awaitMessages(m => m.author.id == message.author.id && m.content > 0 && m.content < length + 1, {
            max: 1,
            time: 60000,
            errors: ['cancel', 'cancelar']
          });
          if (!index.first()) {
            embed
              .setColor(message.colors.red)
              .setTitle(message.defaults.redun + '¡No se recibió respuesta!')
              .setDescription('Debes seleccionar un número del índice, ¡inténtalo de nuevo!');
            message.channel.send({ embed });
            if (message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) message.delete();
            msg.delete();
            return;
          } else {
            if (message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) message.delete();
            msg.delete();
            return await o(members[index.first().content - 1]);
          }
        }
      }
      async function o(m) {
        embed.setColor(message.colors.ginko);
        message.channel.send({ embed });
      }
    } catch (e) {
      console.error(e);
      this.client.postError({
        type: 'command',
        message: message,
        commandName: this.help.name,
        description: e
      });
    }
  }
};
