const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync');
const config = require('./config.json');

sqlite.connect('trainings.db');
// date_created DATETIME DEFAULT CURRENT_TIMESTAMP
sqlite.run(`CREATE TABLE IF NOT EXISTS people(
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    answer TEXT NOT NULL,
    name TEXT NOT NULL,
    name_id TEXT NOT NULL,
    date_created TEXT,
    time_created TEXT
  );`, function (res) {
    if (res.error)
        throw res.error;
});

const token = config.token;
const bot = new TelegramBot(token, {
    polling: true,
    filepath: false
});

let options = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
                [{
                text: 'Прийду',
                callback_data: '1'
            }, {
                text: 'Не прийду',
                callback_data: '2'
            }]
    ]
    })
};



// isChoiseXists = function(){
   
//     const choise = sqlite.run("SELECT name_id, date_created FROM people");
//     // console.log(choise);

//     const choiseArr = choise.filter(function(key){
//         if (key.date_created===new Date().toLocaleDateString() && key.name_id == chatId){
//             console.log("вы уже подавали заявку сегодня");
//             bot.sendMessage(msg.chat.id, 'Сегодня вы уже подавали заявку:'+', ' +`${name}` , {
//                 parse_mode: 'markdown'
//             });
//         } else{
//             bot.sendMessage(msg.chat.id, 'Пожалуйста, подтвердите свое участие:', options);
//         }
        
//                                                  });
    
//     // console.log("вы уже подавали заявку сегодня");
//         // console.log(kayakerName);
//  }



bot.onText(/\/start/, function (msg, match) {
    const choise = sqlite.run("SELECT * FROM people");
    console.log(choise);
//     for (let i=0; i<choise.length; i++){
//         if (choise[i].name_id == chatId && choise[i].date_created==new Date().toLocaleDateString()) {
// console.log(choise[3].name_id);
//         }
//     }

    
    
    
      
    // isChoiseXists();
    bot.sendMessage(msg.chat.id, 'Пожалуйста, подтвердите свое участие:', options);
});

// console.log(sqlite.run("SELECT * FROM people WHERE answer='1' and date_created='3/17/2019'"));

//  add data to DB when button clicked
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const name = msg.chat.first_name;
    const date = new Date().toLocaleDateString();
    const time =new Date().toLocaleTimeString();
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    let text;
    if (action === '1') {
        sqlite.insert("people", {
            answer: action,
            name_id: chatId,
            name: name,
            date_created: date,
            time_created: time
        }, function (res) {
            if (res.error) {
                bot.sendMessage(chatId, `Что-то пошло не так... Пожалуйста, попробуйте позже, ${name}`);
                throw res.error;
            }
        });
        text = `Отлично! Хорощей тренировки, ${name}`;
    } else {
        sqlite.insert("people", {
            answer: action,
            name_id: chatId,
            name: name,
            date_created: date,
            time_created: time
        }, function (res) {
            if (res.error) {
                bot.sendMessage(chatId, `Что-то пошло не так... Пожалуйста, попробуйте позже, ${name}`);
                throw res.error;
            }
        });
        text = `Очень жаль... Увидимся в следуюший раз, ${name}!`;
    }
    //    console.log(new Date().toLocaleDateString());
    console.log(msg);

    bot.editMessageText(text, opts);
    // bot.sendMessage(msg.chat.id, text);
});


// get list of kayakers
bot.onText(/\/getlist/, (msg) => {
    const animals = sqlite.run("SELECT name, date_created FROM people WHERE answer='1'") ;
    // console.log(animals);
    const kayakers = animals.filter(function(key){
        if (key.date_created===new Date().toLocaleDateString()){
            return key.name
        }
                 });
    // console.log(kayakers);
let kayakerName=[];
    for (let i=0; i<kayakers.length; i++){
        kayakerName.push(kayakers[i].name);
}
        // console.log(kayakerName);
       bot.sendMessage(msg.chat.id, 'Сегодня подали заявки:' + '   ' +`${JSON.stringify(kayakerName.join(', '))}` , {
            parse_mode: 'markdown'
            // parse_mode: "HTML"
        });
});