"use strict";

module.exports = class handleGarbageQuestion {
    constructor() {
        this.required_parameter = {
            date: {
                message_to_confirm: {
                    type: 'template',
                    altText: 'どうも。今日もしくは明日のを選択してください',
                    template: {
                        type: 'buttons',
                        text: 'どうも。今日もしくは明日のを選択してください',
                        actions: [
                            {
                                type: 'postback',
                                label: '今日',
                                date: 'today'
                            },
                            {
                                type: 'postback',
                                label: '明日',
                                date: 'tomorrow'
                            }
                        ]
                    }
                },
                parser: (value, bot, event, context, resolve, reject) => {
                    if (['今日', '明日'].includes(value)) {
                        return resolve(value);
                    }
                    return reject();
                }
            }
        }

        console.log(this.required_parameter);
    }

    // パラメータが全部揃ったら実行する処理
    finish(bot, event, context, resolve, reject) {
        let message = {
            text: `${context.confirmed.date}ですね！`
        };
        return bot.reply(message).then((response) => {
            return resolve();
        });
    }
};
