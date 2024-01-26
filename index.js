const express = require('express');
const jsonData = require('./public/allMonthMeekat.json');
const TelegramBot = require('node-telegram-bot-api');
const { MongooseConnect, FcmBatch, saveToken} = require('./database')
require('dotenv').config();

MongooseConnect();

//Initializing admin for fcm (firebase cloud messaging)
const admin = require("firebase-admin");

const serviceAccount = require("./meekat-us-salat-firebase-adminsdk-88kdx-6d7431fdd2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const token = process.env.TOKEN; // one bot will handle everything
const bot = new TelegramBot(token, {polling: true});

const myChatId = process.env.MYCHATID;
const chatId_hash1 = process.env.CHATID_HASH1;   // meekat group chat-id
const chatId_hash2 = process.env.CHATID_HASH2;   // meekat group chat-id
const chatId_hash3 = process.env.CHATID_HASH3;   // meekat group chat-id
const chatId_hash4 = process.env.CHATID_HASH4;   // meekat group chat-id
const chatId_hash5 = process.env.CHATID_HASH5;   // meekat group chat-id
const chatId_hash6 = process.env.CHATID_HASH6;   // meekat group chat-id
const chatId_hash7 = process.env.CHATID_HASH7;   // meekat group chat-id
const chatId_hash8 = process.env.CHATID_HASH8;   // meekat group chat-id
const chatId_hash9 = process.env.CHATID_HASH9;   // meekat group chat-id

const allGroupChatIds = [
    chatId_hash1,
    chatId_hash2,
    chatId_hash3,
    chatId_hash4,
    chatId_hash5,
    chatId_hash6,
    chatId_hash7,
    chatId_hash8,
    chatId_hash9,
];

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.json());

const targetTimeZone = 'Asia/Kolkata'


app.get('/enableNotification', (req, res) => {
    res.render('enableNotification');
});

// handle notification token and save it to the database
app.post('/token_recieve',async (req, res) => {

    console.log(req.body);
    await saveToken(req.body.district.toLowerCase(), req.body.token)
     .then((result) => {
         res.json(result);
     })
    
});

app.post('/disableNotification',async (req, res) => {
    await FcmBatch.findOne({ districtHash: req.body.districtHash })
        .then((consernedDistrict) => {
            if (consernedDistrict) {
                
                const consernedBatch = consernedDistrict.tokens[req.body.indexOfBatch];

                const indexOfFcmInBatch = consernedBatch.indexOf(req.body.fcmToken);

                consernedBatch.splice(indexOfFcmInBatch, 1);

                consernedDistrict.save();
            }
        }).then(() => {
            res.sendStatus(200);
        })

})




// now send notification when we send telegeram notification
// creating functions to send notification on fajr zuhr asr magrib and isha with passing in the token from db


// use salah as first word capital as it will be in notification directly
const salahNotification = function (districtHash, salah) {
    FcmBatch.findOne({ districtHash: districtHash })
        .then((consernedDistrict) => {
            // we have to send notification to token array
            
            if (consernedDistrict && consernedDistrict.tokens[0].length) {
                consernedDistrict.tokens.forEach((tokenBatch) => {
                    const message = {
                        data: {
                          title: `${salah} Namaz Started`,
                          body: "Headover to salah",
                        },
                        tokens: tokenBatch
                      };
                      admin.messaging().sendEachForMulticast(message)
                      .then((response) => {
                        // Handle successful responses
                        console.log('Multicast messages sent successfully:', response);
                      })
                      .catch((error) => {
                        // Handle errors
                        console.error('Error sending multicast messages:', error);
                      });
                })
            }
        })
};

// salahNotification('hash9', "Zuhr");








app.get("/", (req, res) => {



    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: targetTimeZone };
    var today1 = new Date();
    var urduDate = new Intl.DateTimeFormat('ur-PK', options).format(today1);
    urduDate = urduDate.replace(/،/g, '');
    var today2 = new Date();
    var islamicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric', timeZone: targetTimeZone }).format(today2);

    var month = new Intl.DateTimeFormat('en-IN', { month: 'numeric', timeZone: targetTimeZone }).format(today1);
    var day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: targetTimeZone }).format(today1);
    month_today = (+month);
    day_today = +day;
    meekatToday = jsonData[month_today][day_today];

    res.render('index', {
        place: "سرینگر",
        fajrStart: meekatToday.fajrStart,
        zuhrStart: meekatToday.zuhrStart,
        asrStart: meekatToday.asrStart,
        magribStart: meekatToday.magribStart,
        ishaStart: meekatToday.ishaStart,
        tuluAftab: meekatToday.tuluAftab,
        nisfNahar: meekatToday.nisfNahar,
        urduDate: urduDate,
        islamicDate: islamicDate
    });


});

app.post("/:place", (req, res) => {

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: targetTimeZone };
    var today1 = new Date();
    var urduDate = new Intl.DateTimeFormat('ur-PK', options).format(today1);
    urduDate = urduDate.replace(/،/g, '');
    var today2 = new Date();
    var islamicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric', timeZone: targetTimeZone }).format(today2);

    var month = new Intl.DateTimeFormat('en-IN', { month: 'numeric', timeZone: targetTimeZone }).format(today1);
    var day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: targetTimeZone }).format(today1);
    month_today = (+month );
    day_today = +day;
    meekatToday = jsonData[month_today][day_today];

    const location = req.params.place;


    fajrStart = meekatToday.fajrStart;
    let [fajrhours, fajrminutes] = fajrStart.split(':');
    let fajrTime = new Date();
    fajrTime.setHours(parseInt(fajrhours, 10));
    fajrTime.setMinutes(parseInt(fajrminutes, 10));


    zuhrStart = meekatToday.zuhrStart;
    let [zuhrhours, zuhrminutes] = zuhrStart.split(':');
    let zuhrTime = new Date();
    zuhrTime.setHours(parseInt(zuhrhours, 10));
    zuhrTime.setMinutes(parseInt(zuhrminutes, 10));


    asrStart = meekatToday.asrStart;
    let [asrhours, asrminutes] = asrStart.split(':');
    let asrTime = new Date();
    asrTime.setHours(parseInt(asrhours, 10));
    asrTime.setMinutes(parseInt(asrminutes, 10));


    magribStart = meekatToday.magribStart;
    let [magribhours, magribminutes] = magribStart.split(':');
    let magribTime = new Date();
    magribTime.setHours(parseInt(magribhours, 10));
    magribTime.setMinutes(parseInt(magribminutes, 10));


    ishaStart = meekatToday.ishaStart;
    let [ishahours, ishaminutes] = ishaStart.split(':');
    let ishaTime = new Date();
    ishaTime.setHours(parseInt(ishahours, 10));
    ishaTime.setMinutes(parseInt(ishaminutes, 10));


    tuluAftab = meekatToday.tuluAftab;
    let [tuluhours, tuluminutes] = tuluAftab.split(':');
    let tuluTime = new Date();
    tuluTime.setHours(parseInt(tuluhours, 10));
    tuluTime.setMinutes(parseInt(tuluminutes, 10));


    nisfNahar = meekatToday.nisfNahar;
    let [nisfhours, nisfminutes] = nisfNahar.split(':');
    let nisfTime = new Date();
    nisfTime.setHours(parseInt(nisfhours, 10));
    nisfTime.setMinutes(parseInt(nisfminutes, 10));


    switch (location) {

        case "Uri":
            fajrTime.setMinutes(fajrTime.getMinutes() + 3);
            zuhrTime.setMinutes(zuhrTime.getMinutes() + 3);
            asrTime.setMinutes(asrTime.getMinutes() + 3);
            magribTime.setMinutes(magribTime.getMinutes() + 3);
            ishaTime.setMinutes(ishaTime.getMinutes() + 3);
            tuluTime.setMinutes(tuluTime.getMinutes() + 3);
            nisfTime.setMinutes(nisfTime.getMinutes() + 3);
            break;

        case "Baramulla":
        case "Tangmarg":
        case "Sopore":
            fajrTime.setMinutes(fajrTime.getMinutes() + 1);
            zuhrTime.setMinutes(zuhrTime.getMinutes() + 1);
            asrTime.setMinutes(asrTime.getMinutes() + 1);
            magribTime.setMinutes(magribTime.getMinutes() + 1);
            ishaTime.setMinutes(ishaTime.getMinutes() + 1);
            tuluTime.setMinutes(tuluTime.getMinutes() + 1);
            nisfTime.setMinutes(nisfTime.getMinutes() + 1);
            break;

        case "Bandipora":
        case "Punch":
            fajrTime.setMinutes(fajrTime.getMinutes() + 2);
            zuhrTime.setMinutes(zuhrTime.getMinutes() + 2);
            asrTime.setMinutes(asrTime.getMinutes() + 2);
            magribTime.setMinutes(magribTime.getMinutes() + 2);
            ishaTime.setMinutes(ishaTime.getMinutes() + 2);
            tuluTime.setMinutes(tuluTime.getMinutes() + 2);
            nisfTime.setMinutes(nisfTime.getMinutes() + 2);
            break;

        case "Teetwal":
        case "Karna":
            fajrTime.setMinutes(fajrTime.getMinutes() + 4);
            zuhrTime.setMinutes(zuhrTime.getMinutes() + 4);
            asrTime.setMinutes(asrTime.getMinutes() + 4);
            magribTime.setMinutes(magribTime.getMinutes() + 4);
            ishaTime.setMinutes(ishaTime.getMinutes() + 4);
            tuluTime.setMinutes(tuluTime.getMinutes() + 4);
            nisfTime.setMinutes(nisfTime.getMinutes() + 4);
            break;

        case "IslamAbad":
        case "Tral":
            fajrTime.setMinutes(fajrTime.getMinutes() - 2);
            zuhrTime.setMinutes(zuhrTime.getMinutes() - 2);
            asrTime.setMinutes(asrTime.getMinutes() - 2);
            magribTime.setMinutes(magribTime.getMinutes() - 2);
            ishaTime.setMinutes(ishaTime.getMinutes() - 2);
            tuluTime.setMinutes(tuluTime.getMinutes() - 2);
            nisfTime.setMinutes(nisfTime.getMinutes() - 2);
            break;

        case "Pulwama":
        case "Kulgam":
        case "Harmukh":
            fajrTime.setMinutes(fajrTime.getMinutes() - 1);
            zuhrTime.setMinutes(zuhrTime.getMinutes() - 1);
            asrTime.setMinutes(asrTime.getMinutes() - 1);
            magribTime.setMinutes(magribTime.getMinutes() - 1);
            ishaTime.setMinutes(ishaTime.getMinutes() - 1);
            tuluTime.setMinutes(tuluTime.getMinutes() - 1);
            nisfTime.setMinutes(nisfTime.getMinutes() - 1);
            break;

        case "Leh":
            fajrTime.setMinutes(fajrTime.getMinutes() - 11);
            zuhrTime.setMinutes(zuhrTime.getMinutes() - 11);
            asrTime.setMinutes(asrTime.getMinutes() - 11);
            magribTime.setMinutes(magribTime.getMinutes() - 11);
            ishaTime.setMinutes(ishaTime.getMinutes() - 11);
            tuluTime.setMinutes(tuluTime.getMinutes() - 11);
            nisfTime.setMinutes(nisfTime.getMinutes() - 11);
            break;

        case "Pahalgam":
            fajrTime.setMinutes(fajrTime.getMinutes() - 3);
            zuhrTime.setMinutes(zuhrTime.getMinutes() - 3);
            asrTime.setMinutes(asrTime.getMinutes() - 3);
            magribTime.setMinutes(magribTime.getMinutes() - 3);
            ishaTime.setMinutes(ishaTime.getMinutes() - 3);
            tuluTime.setMinutes(tuluTime.getMinutes() - 3);
            nisfTime.setMinutes(nisfTime.getMinutes() - 3);
            break;
        case "Srinagar":

            // send these as it is because srinagar needs no modification
            fajrTime;
            zuhrTime;
            asrTime;
            magribTime;
            ishaTime;
            tuluTime;
            nisfTime;
            break;

        default:
            res.send("<h1>BAD REQUEST TO SERVER</h1>");
    }

    let place;

    switch (location) {
        case "Uri":
            place = "اوری";
            break;

        case "Baramulla":
            place = "بارہمولہ";
            break;

        case "Tangmarg":
            place = "ٹنگمرگ";
            break;

        case "Sopore":
            place = "سوپور";
            break;

        case "Bandipora":
            place = "بانڈیپورہ";
            break;

        case "Punch":
            place = "پنچ";
            break;

        case "Teetwal":
            place = "ٹیٹوال";
            break;

        case "Karna":
            place = "کرنہ";
            break;

        case "IslamAbad":
            place = "اسلام آباد";
            break;

        case "Tral":
            place = "ترال";
            break;

        case "Pulwama":
            place = "پلوامہ";
            break;

        case "Kulgam":
            place = "کلگام";
            break;

        case "Harmukh":
            place = "ہرمخ";
            break;

        case "Leh":
            place = "لہ";
            break;

        case "Pahalgam":
            place = "پہل گام";
            break;

        case "Srinagar":
            place = "سرینگر";
            break;

        default:
            res.send("<h1>BAD REQUEST TO SERVER</h1>");
    }



    res.render('index', {
        place: place,
        fajrStart: `${fajrTime.getHours()}:${fajrTime.getMinutes() < 10 ? '0' : ''}${fajrTime.getMinutes()}`,
        zuhrStart: `${zuhrTime.getHours()}:${zuhrTime.getMinutes() < 10 ? '0' : ''}${zuhrTime.getMinutes()}`,
        asrStart: `${asrTime.getHours()}:${asrTime.getMinutes() < 10 ? '0' : ''}${asrTime.getMinutes()}`,
        magribStart: `${magribTime.getHours()}:${magribTime.getMinutes() < 10 ? '0' : ''}${magribTime.getMinutes()}`,
        ishaStart: `${ishaTime.getHours()}:${ishaTime.getMinutes() < 10 ? '0' : ''}${ishaTime.getMinutes()}`,
        tuluAftab: `${tuluTime.getHours()}:${tuluTime.getMinutes() < 10 ? '0' : ''}${tuluTime.getMinutes()}`,
        nisfNahar: `${nisfTime.getHours()}:${nisfTime.getMinutes() < 10 ? '0' : ''}${nisfTime.getMinutes()}`,
        urduDate: urduDate,
        islamicDate: islamicDate
    });

});

// function to send message:
const sendTimeToDistricts = function(){

    var today1 = new Date();

    var month = new Intl.DateTimeFormat('en-IN', { month: 'numeric', timeZone: targetTimeZone }).format(today1);
    var day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: targetTimeZone }).format(today1);
    month_today = (+month );
    day_today = +day;
    meekatToday = jsonData[month_today][day_today];

    


    //get current date in form of like => 6:02 and check typeof to compare in future--
    const now = new Date();
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: targetTimeZone,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);

    const parts = formatter.formatToParts(now);

    let hours, minutes, am_pm;

    /////// Extract hours and minutes    
    for (const part of parts) {
        if (part.type === 'hour') {
            hours = part.value;
        } else if (part.type === 'minute') {
            minutes = part.value;
        } else if (part.type === 'dayPeriod'){
            am_pm = part.value;
        }
    }

    /////// Format the hours and minutes with leading zeros if needed
    // const formattedHours = hours % 12 || 12;   /// crucial to convert to 12hr format

    /////// Create the time string in the format "HH:mm"
    const timeString = `${hours}:${minutes}_${am_pm}`;

    //All prayer time alter function:
    const allPrayerTimealter = function(value){

    const fajrStart = meekatToday.fajrStart;
    let [fajrhours, fajrminutes] = fajrStart.split(':');
    let fajrTime = new Date();
    fajrTime.setHours(parseInt(fajrhours, 10));
    fajrTime.setMinutes(parseInt(fajrminutes, 10));


    const zuhrStart = meekatToday.zuhrStart;
    let [zuhrhours, zuhrminutes] = zuhrStart.split(':');
    let zuhrTime = new Date();
    zuhrTime.setHours(parseInt(zuhrhours, 10));
    zuhrTime.setMinutes(parseInt(zuhrminutes, 10));

    const asrStart = meekatToday.asrStart;
    let [asrhours, asrminutes] = asrStart.split(':');
    let asrTime = new Date();
    asrTime.setHours(parseInt(asrhours, 10));
    asrTime.setMinutes(parseInt(asrminutes, 10));


    const magribStart = meekatToday.magribStart;
    let [magribhours, magribminutes] = magribStart.split(':');
    let magribTime = new Date();
    magribTime.setHours(parseInt(magribhours, 10));
    magribTime.setMinutes(parseInt(magribminutes, 10));


    const ishaStart = meekatToday.ishaStart;
    let [ishahours, ishaminutes] = ishaStart.split(':');
    let ishaTime = new Date();
    ishaTime.setHours(parseInt(ishahours, 10));
    ishaTime.setMinutes(parseInt(ishaminutes, 10));

        fajrTime.setMinutes(fajrTime.getMinutes() + value);
        zuhrTime.setMinutes(zuhrTime.getMinutes() + value);
        asrTime.setMinutes(asrTime.getMinutes() + value);
        magribTime.setMinutes(magribTime.getMinutes() + value);
        ishaTime.setMinutes(ishaTime.getMinutes() + value);




        return {
            fajrStart: `${fajrTime.getHours()}:${fajrTime.getMinutes() < 10 ? '0' : ''}${fajrTime.getMinutes()}_AM`,
            zuhrStart: `${zuhrTime.getHours()}:${zuhrTime.getMinutes() < 10 ? '0' : ''}${zuhrTime.getMinutes()}_PM`,
            asrStart: `${asrTime.getHours()}:${asrTime.getMinutes() < 10 ? '0' : ''}${asrTime.getMinutes()}_PM`,
            magribStart: `${magribTime.getHours()}:${magribTime.getMinutes() < 10 ? '0' : ''}${magribTime.getMinutes()}_PM`,
            ishaStart: `${ishaTime.getHours()}:${ishaTime.getMinutes() < 10 ? '0' : ''}${ishaTime.getMinutes()}_PM`,
        }
    }



    //Send fajr timing to all groups
    //Send to all possible value we have for above function input

    //********************************** Areas hash1 : value=3 *********************************/
    const fajrStart_hash1 = allPrayerTimealter(3).fajrStart;  // it is a string // _t : telegram feature
    const zuhrStart_hash1 = allPrayerTimealter(3).zuhrStart;
    const asrStart_hash1 =  allPrayerTimealter(3).asrStart;
    const magribStart_hash1 = allPrayerTimealter(3).magribStart;
    const ishaStart_hash1 = allPrayerTimealter(3).ishaStart;

    // send message to hash1 areas via telegram;

    switch (timeString) {
        case fajrStart_hash1:
            bot.sendMessage(chatId_hash1, 'شروع فجر'+'  :  '+fajrStart_hash1);
            salahNotification('hash1', 'Fajr');
            
            break;
        case zuhrStart_hash1:
            bot.sendMessage(chatId_hash1, 'شروع ظهر'+'  :  '+zuhrStart_hash1);
            salahNotification('hash1', 'Zuhr');

            break;
        case asrStart_hash1:
            bot.sendMessage(chatId_hash1, 'شروع عصر'+'  :  '+asrStart_hash1);
            salahNotification('hash1', 'Asr');

            break;
        case magribStart_hash1:
            bot.sendMessage(chatId_hash1, 'شروع مغرب'+'  :  '+magribStart_hash1);
            salahNotification('hash1', 'Magrib');

            break;
        case ishaStart_hash1:
            bot.sendMessage(chatId_hash1, 'شروع عشاء'+'  :  '+ishaStart_hash1);
            salahNotification('hash1', 'Isha');

            break;
    
        default:
            break;
    }   
    
    //********************************** Areas hash2 : value=1 *********************************/     

    const fajrStart_hash2 = allPrayerTimealter(1).fajrStart;  // it is a string
    const zuhrStart_hash2 = allPrayerTimealter(1).zuhrStart;
    const asrStart_hash2 =  allPrayerTimealter(1).asrStart;
    const magribStart_hash2 = allPrayerTimealter(1).magribStart;
    const ishaStart_hash2 = allPrayerTimealter(1).ishaStart;

    switch (timeString) {
        case fajrStart_hash2:
            bot.sendMessage(chatId_hash2, 'شروع فجر'+'  :  '+fajrStart_hash2);
            salahNotification('hash2', 'Fajr');
            
            break;
        case zuhrStart_hash2:
            bot.sendMessage(chatId_hash2, 'شروع ظهر'+'  :  '+zuhrStart_hash2);
            salahNotification('hash2', 'Zuhr');

            break;
        case asrStart_hash2:
            bot.sendMessage(chatId_hash2, 'شروع عصر'+'  :  '+asrStart_hash2);
            salahNotification('hash2', 'Asr');

            break;
        case magribStart_hash2:
            bot.sendMessage(chatId_hash2, 'شروع مغرب'+'  :  '+magribStart_hash2);
            salahNotification('hash2', 'Magrib');

            break;
        case ishaStart_hash2:
            bot.sendMessage(chatId_hash2, 'شروع عشاء'+'  :  '+ishaStart_hash2);
            salahNotification('hash2', 'Isha');

            break;
    
        default:
            break;
    }  

    //********************************** Areas hash3 : value=2 *********************************/     

    const fajrStart_hash3 = allPrayerTimealter(2).fajrStart;  // it is a string
    const zuhrStart_hash3 = allPrayerTimealter(2).zuhrStart;
    const asrStart_hash3 =  allPrayerTimealter(2).asrStart;
    const magribStart_hash3 = allPrayerTimealter(2).magribStart;
    const ishaStart_hash3 = allPrayerTimealter(2).ishaStart;

    switch (timeString) {
        case fajrStart_hash3:
            bot.sendMessage(chatId_hash3, 'شروع فجر'+'  :  '+fajrStart_hash3);
            salahNotification('hash3', 'Fajr');
            
            break;
        case zuhrStart_hash3:
            bot.sendMessage(chatId_hash3, 'شروع ظهر'+'  :  '+zuhrStart_hash3);
            salahNotification('hash3', 'Zuhr');

            break;
        case asrStart_hash3:
            bot.sendMessage(chatId_hash3, 'شروع عصر'+'  :  '+asrStart_hash3);
            salahNotification('hash3', 'Asr');

            break;
        case magribStart_hash3:
            bot.sendMessage(chatId_hash3, 'شروع مغرب'+'  :  '+magribStart_hash3);
            salahNotification('hash3', 'Magrib');

            break;
        case ishaStart_hash3:
            bot.sendMessage(chatId_hash3, 'شروع عشاء'+'  :  '+ishaStart_hash3);
            salahNotification('hash3', 'Isha');

            break;
    
        default:
            break;
    }  

    //********************************** Areas hash4 : value=4 *********************************/     

    const fajrStart_hash4 = allPrayerTimealter(4).fajrStart;  // it is a string
    const zuhrStart_hash4 = allPrayerTimealter(4).zuhrStart;
    const asrStart_hash4 =  allPrayerTimealter(4).asrStart;
    const magribStart_hash4 = allPrayerTimealter(4).magribStart;
    const ishaStart_hash4 = allPrayerTimealter(4).ishaStart;

    switch (timeString) {
        case fajrStart_hash4:
            bot.sendMessage(chatId_hash4, 'شروع فجر'+'  :  '+fajrStart_hash4);
            salahNotification('hash4', 'Fajr');
            
            break;
        case zuhrStart_hash4:
            bot.sendMessage(chatId_hash4, 'شروع ظهر'+'  :  '+zuhrStart_hash4);
            salahNotification('hash4', 'Zuhr');

            break;
        case asrStart_hash4:
            bot.sendMessage(chatId_hash4, 'شروع عصر'+'  :  '+asrStart_hash4);
            salahNotification('hash4', 'Asr');

            break;
        case magribStart_hash4:
            bot.sendMessage(chatId_hash4, 'شروع مغرب'+'  :  '+magribStart_hash4);
            salahNotification('hash4', 'Magrib');

            break;
        case ishaStart_hash4:
            bot.sendMessage(chatId_hash4, 'شروع عشاء'+'  :  '+ishaStart_hash4);
            salahNotification('hash4', 'Isha');

            break;
    
        default:
            break;
    }  

    //********************************** Areas hash5 : value=-2 *********************************/     

    const fajrStart_hash5 = allPrayerTimealter(-2).fajrStart;  // it is a string
    const zuhrStart_hash5 = allPrayerTimealter(-2).zuhrStart;
    const asrStart_hash5 =  allPrayerTimealter(-2).asrStart;
    const magribStart_hash5 = allPrayerTimealter(-2).magribStart;
    const ishaStart_hash5 = allPrayerTimealter(-2).ishaStart;

    switch (timeString) {
        case fajrStart_hash5:
            bot.sendMessage(chatId_hash5, 'شروع فجر'+'  :  '+fajrStart_hash5);
            salahNotification('hash5', 'Fajr');
            
            break;
        case zuhrStart_hash5:
            bot.sendMessage(chatId_hash5, 'شروع ظهر'+'  :  '+zuhrStart_hash5);
            salahNotification('hash5', 'Zuhr');

            break;
        case asrStart_hash5:
            bot.sendMessage(chatId_hash5, 'شروع عصر'+'  :  '+asrStart_hash5);
            salahNotification('hash5', 'Asr');

            break;
        case magribStart_hash5:
            bot.sendMessage(chatId_hash5, 'شروع مغرب'+'  :  '+magribStart_hash5);
            salahNotification('hash5', 'Magrib');

            break;
        case ishaStart_hash5:
            bot.sendMessage(chatId_hash5, 'شروع عشاء'+'  :  '+ishaStart_hash5);
            salahNotification('hash5', 'Isha');

            break;
    
        default:
            break;
    }    

    //********************************** Areas hash6 : value=-1 *********************************/     

    const fajrStart_hash6 = allPrayerTimealter(-1).fajrStart;  // it is a string
    const zuhrStart_hash6 = allPrayerTimealter(-1).zuhrStart;
    const asrStart_hash6 =  allPrayerTimealter(-1).asrStart;
    const magribStart_hash6 = allPrayerTimealter(-1).magribStart;
    const ishaStart_hash6 = allPrayerTimealter(-1).ishaStart;

    switch (timeString) {
        case fajrStart_hash6:
            bot.sendMessage(chatId_hash6, 'شروع فجر'+'  :  '+fajrStart_hash6);
            salahNotification('hash6', 'Fajr');
            
            break;
        case zuhrStart_hash6:
            bot.sendMessage(chatId_hash6, 'شروع ظهر'+'  :  '+zuhrStart_hash6);
            salahNotification('hash6', 'Zuhr');

            break;
        case asrStart_hash6:
            bot.sendMessage(chatId_hash6, 'شروع عصر'+'  :  '+asrStart_hash6);
            salahNotification('hash6', 'Asr');

            break;
        case magribStart_hash6:
            bot.sendMessage(chatId_hash6, 'شروع مغرب'+'  :  '+magribStart_hash6);
            salahNotification('hash6', 'Magrib');

            break;
        case ishaStart_hash6:
            bot.sendMessage(chatId_hash6, 'شروع عشاء'+'  :  '+ishaStart_hash6);
            salahNotification('hash6', 'Isha');

            break;
    
        default:
            break;
    }   

    //********************************** Areas hash7 : value=-11 *********************************/     

    const fajrStart_hash7 = allPrayerTimealter(-11).fajrStart;  // it is a string
    const zuhrStart_hash7 = allPrayerTimealter(-11).zuhrStart;
    const asrStart_hash7 =  allPrayerTimealter(-11).asrStart;
    const magribStart_hash7 = allPrayerTimealter(-11).magribStart;
    const ishaStart_hash7 = allPrayerTimealter(-11).ishaStart;

    switch (timeString) {
        case fajrStart_hash7:
            bot.sendMessage(chatId_hash7, 'شروع فجر'+'  :  '+fajrStart_hash7);
            salahNotification('hash7', 'Fajr');
            
            break;
        case zuhrStart_hash7:
            bot.sendMessage(chatId_hash7, 'شروع ظهر'+'  :  '+zuhrStart_hash7);
            salahNotification('hash7', 'Zuhr');

            break;
        case asrStart_hash7:
            bot.sendMessage(chatId_hash7, 'شروع عصر'+'  :  '+asrStart_hash7);
            salahNotification('hash7', 'Asr');

            break;
        case magribStart_hash7:
            bot.sendMessage(chatId_hash7, 'شروع مغرب'+'  :  '+magribStart_hash7);
            salahNotification('hash7', 'Magrib');

            break;
        case ishaStart_hash7:
            bot.sendMessage(chatId_hash7, 'شروع عشاء'+'  :  '+ishaStart_hash7);
            salahNotification('hash7', 'Isha');

            break;
    
        default:
            break;
    }   

    //********************************** Areas hash8 : value=-3 *********************************/     

    const fajrStart_hash8 = allPrayerTimealter(-3).fajrStart;  // it is a string
    const zuhrStart_hash8 = allPrayerTimealter(-3).zuhrStart;
    const asrStart_hash8 =  allPrayerTimealter(-3).asrStart;
    const magribStart_hash8 = allPrayerTimealter(-3).magribStart;
    const ishaStart_hash8 = allPrayerTimealter(-3).ishaStart;
// console.log(zuhrStart_hash8);
    switch (timeString) {
        case fajrStart_hash8:
            bot.sendMessage(chatId_hash8, 'شروع فجر'+'  :  '+fajrStart_hash8);
            salahNotification('hash8', 'Fajr');
            
            break;
        case zuhrStart_hash8:
            bot.sendMessage(chatId_hash8, 'شروع ظهر'+'  :  '+zuhrStart_hash8);
            salahNotification('hash8', 'Zuhr');

            break;
        case asrStart_hash8:
            bot.sendMessage(chatId_hash8, 'شروع عصر'+'  :  '+asrStart_hash8);
            salahNotification('hash8', 'Asr');

            break;
        case magribStart_hash8:
            bot.sendMessage(chatId_hash8, 'شروع مغرب'+'  :  '+magribStart_hash8);
            salahNotification('hash8', 'Magrib');

            break;
        case ishaStart_hash8:
            bot.sendMessage(chatId_hash8, 'شروع عشاء'+'  :  '+ishaStart_hash8);
            salahNotification('hash8', 'Isha');

            break;

        default:
            break;
    }    


    //********************************** Areas hash9 : value=0 *********************************/     

    const fajrStart_hash9 = allPrayerTimealter(0).fajrStart;  // it is a string
    const zuhrStart_hash9 = allPrayerTimealter(0).zuhrStart;
    const asrStart_hash9 =  allPrayerTimealter(0).asrStart;
    const magribStart_hash9 = allPrayerTimealter(0).magribStart;
    const ishaStart_hash9 = allPrayerTimealter(0).ishaStart;

    switch (timeString) {
        case fajrStart_hash9:
            bot.sendMessage(chatId_hash9, 'شروع فجر'+'  :  '+fajrStart_hash9);
            salahNotification('hash9', 'Fajr');
            
            break;
        case zuhrStart_hash9:
            bot.sendMessage(chatId_hash9, 'شروع ظهر'+'  :  '+zuhrStart_hash9);
            salahNotification('hash9', 'Zuhr');

            break;
        case asrStart_hash9:
            bot.sendMessage(chatId_hash9, 'شروع عصر'+'  :  '+asrStart_hash9);
            salahNotification('hash9', 'Asr');

            break;
        case magribStart_hash9:
            bot.sendMessage(chatId_hash9, 'شروع مغرب'+'  :  '+magribStart_hash9);
            salahNotification('hash9', 'Magrib');

            break;
        case ishaStart_hash9:
            bot.sendMessage(chatId_hash9, 'شروع عشاء'+'  :  '+ishaStart_hash9);
            salahNotification('hash9', 'Isha');

            break;
    
        default:
            break;
    }  

}

// functoin to send )greetings and date) Everyday--
const sendDateGreet = function(){

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: targetTimeZone };
    var today1 = new Date();
    var urduDate = new Intl.DateTimeFormat('ur-PK', options).format(today1);
    urduDate = urduDate.replace(/،/g, '');
    var today2 = new Date();
    var islamicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric', timeZone: targetTimeZone }).format(today2);

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',   // Full day of the week (e.g., "Sunday")
        year: 'numeric',   // Full year (e.g., "2023")
        month: 'long',    // Full month name (e.g., "January")
        day: 'numeric',    // Day of the month (numeric)
        hour: 'numeric',   // Hour (numeric)
        minute: 'numeric', // Minutes (numeric)
        second: 'numeric', // Seconds (numeric)
        hour12: true,      // Use 12-hour clock format (AM/PM)
        timeZone: targetTimeZone,
    });

    const parts = formatter.formatToParts(now);   // parts actually contain list of formatted time
    let formattedDateTime = '';

    for (const part of parts) {
        formattedDateTime += part.value;
    }

    let hour, minute, second, am_pm;

    /////// Extract hours and minutes    
    for (const part of parts) {
        if (part.type === 'hour') {
            hour = part.value;
        } else if (part.type === 'minute') {
            minute = part.value;
        } else if (part.type === 'second') {
            second = part.value;
        } else if (part.type === 'dayPeriod'){
            am_pm = part.value;
        }
    }

    // console.log(formattedDateTime);
    // console.log(hour, Number(minute), second, am_pm);

    if (Number(hour) === 12 && Number(minute) < 1 && am_pm === 'AM') {

        bot.sendMessage(myChatId, "Assalamualaikum😉 Mr.MohammadAzeem, Your greetings request was send🚀 tonight to all Telegram Meekat-users on ⏲: \n\n\n"+ formattedDateTime + "\n\n\n I might remind you that you have put a threshold of 55 sec. So if you add ⏩55 sec to this time and the time(t) falls in the interval:\n\n  12:00 <= t < 12:01\n\n then greetings will be sended TWICE😐" );

        allGroupChatIds.forEach(eachGroup_id => {
        bot.sendMessage(eachGroup_id,`----------------------------------\n\nالسلام عليكم ورحمة الله وبركاته\n\n\n${urduDate}\n${islamicDate}\n\n\n----------------`);  
        });

    };
};

// Executing sendTimeToDistricts() function after each 20sec;
setInterval(() => {
    sendTimeToDistricts();
}, 58000);

// Executing sendDateGreet() function after each (20s) and check by date in function what is the time in 24 hr clock and trigger accordingly;
setInterval(() => {
    sendDateGreet();
}, 58000);





app.listen(3000, () => {
    console.log("Server is  up and running on port 3000");
});


// hash1 => Uri  **value: 3                         
// hash2 => Baramulla // Tangmarg // Sopore  **value: 1
// hash3 => Bandipora // Punch  **value: 2
// hash4 => Teetwal // Karna  **value: 4
// hash5 => Islamabad // Tral  **value: -2
// hash6 => Pulwama // Kulgam // Harmukh  **value: -1
// hash7 => Leh  **value: -11
// hash8 => Pahalgam  **value: -3
// hash9 => Srinagar // Budgam  **value: 0