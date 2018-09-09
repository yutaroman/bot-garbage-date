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
                        let responseWeek = responses[0].queryResult.parameters.fields.date.stringValue;

                        // 曜日の取得
                        let date = new Date();
                        let dayOfWeek = 0;
                        if (responseWeek === '今日') {
                            dayOfWeek = date.getDay();
                        } else if (responseWeek === '明日') {
                            dayOfWeek = date.getDay() + 1;
                        }
                        let dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek];

                        // ゴミの日条件分岐
                        let garbage_type = '';
                        if (dayOfWeekStr === '月' || dayOfWeekStr === '金') {
                            garbage_type = '可燃';
                        } else if (dayOfWeekStr === '火') {
                            garbage_type = 'プラスチックと紙';
                        } else if (dayOfWeekStr === '土') {
                            garbage_type = 'ビンカン';
                        }

                        let message_text = '';

                        if (garbage_type !== '') {
                            if (responseWeek === '今日') {
                                message_text = `${responseWeek}は${dayOfWeekStr}曜日だから、${garbage_type}ゴミの日よ！`
                            } else if (responseWeek === '明日') {
                                message_text = `${responseWeek}は${dayOfWeekStr}曜日だから、不燃の日ね！！`
                            } else {
                                message_text = '今日、もしくは明日を入力してください。'
                            }
                        } else {
                            message_text = `${responseWeek}は${dayOfWeekStr}曜日だから、ゴミの回収はありません！`
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
