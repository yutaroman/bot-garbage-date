// modules import
const server = require('express')();
const line = require('@line/bot-sdk');

// パラメータの設定
const line_config = {
    // 環境変数からアクセストークンをセット
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    // 環境変数から Channel Secret をセット
    channelSecret: process.env.LINE_CHANNEL_SECRET,
}

// Web サーバーの設定
server.listen(process.env.PORT || 3000);

// ルーターの設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
    console.log(req.body);
});
