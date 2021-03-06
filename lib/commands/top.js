'use strict';

const Discord = require('discord.js');
const apiUtil = require('../util/api');
const { createBasicEmbed } = require('../util/helpers');
const { DEFAULT_COOLDOWN, BASE_EMBED_PROPS } = require('../util/config');

const OPTIONS = ['waitlisted', 'collected', 'popular'];

module.exports = {
  name: 'top',
  usages: [{
    args: `[${OPTIONS.join('|')}]`,
    description: 'Gets the top most waitlisted, collected, or popular games.'
  }],
  cooldown: DEFAULT_COOLDOWN,
  run
};

/**
 * Get top games
 * @param {Discord.Message} msg
 * @param {string} option Message option
 */
async function run(msg, option) {
  if (!OPTIONS.includes(option)) {
    return;
  }

  const embed = new Discord.MessageEmbed({ ...BASE_EMBED_PROPS });

  try {
    if (option === 'waitlisted') {
      const list = await apiUtil.getWaitlistChart(20);

      embed.setTitle('Top Waitlisted Games');
      embed.addFields(getGameCountFields(list));
    } else if (option === 'collected') {
      const list = await apiUtil.getCollectionChart(20);

      embed.setTitle('Top Collected Games');
      embed.addFields(getGameCountFields(list));
    } else if (option === 'popular') {
      const popularities = await apiUtil.getPopularityChart(20);

      embed.setTitle('Top Games By Popularity');
      embed.setDescription([
        'Popularity is computed as normalized count in waitlists',
        'plus normalized count in collections.\n',
        popularities.map(x => `${x.position}. ${x.title}`).join('\n')
      ].join('\n'));
    }

    msg.channel.send({ embed });
  } catch (e) {
    msg.channel.send(createBasicEmbed(e));
  }
}

/**
 * Generate list of fields for game counts
 * @param {Array} list Game list
 * @returns {Array}
 */
function getGameCountFields(list) {
  return [
    {
      name: 'Game',
      value: list.map(x => `${x.position}. ${x.title}`).join('\n'),
      inline: true
    },
    {
      name: 'Count',
      value: list.map(x => formatNumber(x.count)).join('\n'),
      inline: true
    }
  ];
}

/**
 * Format numbers to have commas
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
