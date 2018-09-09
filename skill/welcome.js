"use strict";

const debug = require('debug')('bot-express:skill');

module.exports = class Welcome {
    // パラメーターが全部揃ったら実行する処理
    finish(bot, event, context, resolve, reject) {
        return bot.reply({
            type: 'text',
            text: '友達追加ありがとうございます。ゴミの回収日を返答するかもしれません。'
        }).then((response) => {
            return resolve();
        })
    }
};
