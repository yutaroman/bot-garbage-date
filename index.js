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

// API コールの為のクライアントインスタンスを作成
const bot = new line.Client(line_config);

// ルーターの設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行して LINE 側にステータスコード 200 でレスポンスする。
    res.sendStatus(200);

    // Test code
    // console.log(req.body);

    // イベント処理のプロセスを格納する配列
    let events_processed = [];

    // イベントオブジェクトを順次処理
    req.body.events.forEach((event) => {
        if (event.type === 'message' && event.type === 'text') {
            if (event.message === 'こんにちは') {
                // replyMessage 関数で返信し、そのプロミスを events_processed に追加
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: 'text',
                    message: 'これはこれは'
                }));
            }
        }
    });

    // 全てのイベント処理が終了したら、何個のイベントが処理されたかを出力
    promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
