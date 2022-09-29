const {
    ActionRowBuilder,
    Message,
    MessageEmbed,
    MessageButton,
    ButtonStyle
  } = require("discord.js");

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
 const paginationEmbed = async (
    interaction,
    pages,
    buttonList,
    timeout = 120000
  ) => {
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === ButtonStyle.Link || buttonList[1].style === ButtonStyle.Link)
      throw new Error(
        "Link buttons are not supported"
      );
  
    if (buttonList.length !== 2) throw new Error("Need two buttons.");
  
    let page = 0;
  
    const row = new ActionRowBuilder().addComponents(buttonList);
  
    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred == false) {
      await interaction.deferReply();
    }
  
    const curPage = await interaction.editReply({
      embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
      components: [row],
      fetchReply: true,
    });
  
    const filter = (i) =>
    i.custom_id === buttonList[1].custom_id ||
    i.custom_id === buttonList[0].custom_id;
  
    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: timeout,
    });
  
    collector.on("collect", async (i) => {
   
      switch (i.customId) {
        case buttonList[0].data.custom_id:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case buttonList[1].data.custom_id:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      await i.deferUpdate();
      await i.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row],
      });
      collector.resetTimer();
    });
  
    collector.on("end", (_, reason) => {
      if (reason !== "messageDelete") {
        const disabledRow = new ActionRowBuilder().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true)
        );
        curPage.edit({
          embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
          components: [disabledRow],
        });
      }
    });
  
    return curPage;
  };
  module.exports = paginationEmbed;