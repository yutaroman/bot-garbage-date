// modules import
const server = require('express')();
const line = require('@line/bot-sdk');
const dialogflow = require('dialogflow');

// パラメータの設定
const line_config = {
    // 環境変数からアクセストークンをセット
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    // 環境変数から Channel Secret をセット
    channelSecret: process.env.LINE_CHANNEL_SECRET
}

// Web サーバーの設定
server.listen(process.env.PORT || 3000);

// API コールの為のクライアントインスタンスを作成
const bot = new line.Client(line_config);

// Dialogflow のクライアントインスタンスを作成
const session_client = new dialogflow.SessionsClient({
    project_id: process.env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});

// ルーターの設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行して LINE 側にステータスコード 200 でレスポンスする。
    res.sendStatus(200);

    // イベント処理のプロセスを格納する配列
    let events_processed = [];

    // イベントオブジェクトを順次処理
    req.body.events.map((event) => {
        if (event.type === 'message' && event.message.type === 'text') {
            events_processed.push(
                session_client.detectIntent({
                    session: session_client.sessionPath(process.env.GOOGLE_PROJECT_ID, event.source.userId),
                    queryInput: {
                        text: {
                            text: event.message.text,
                            languageCode: 'ja',
                        }
                    }
                }).then((responses) => {
                    if (responses[0].queryResult && responses[0].queryResult.action === 'handle-garbage-question') {
                        let message_text = '';
                        if (responses[0].queryResult.parameters.fields.date.stringValue) {
                            message_text = `毎度！${responses[0].queryResult.parameters.fields.date.stringValue}ね！！`
                        } else {
                            message_text = '毎度！質問は何！？';
                        }

                        return bot.replyMessage(event.replyToken, {
                            type: 'text',
                            text: message_text
                        });
                    }
                })
            )
        }
    });

    // 全てのイベント処理が終了したら、何個のイベントが処理されたかを出力
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
