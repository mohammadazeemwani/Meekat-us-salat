const express = require('express');
const jsonData = require('./public/allMonthMeekat.json');

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');


var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today = new Date();
var urduDate = today.toLocaleDateString('ur-PK', options);


var today = new Date();
var islamicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);

app.get("/", (req, res) => {

    const date = new Date();

    month_today = (date.getMonth() + 1);
    day_today = date.getDate();


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

app.post("/:place",(req, res) => {

    const date = new Date();
    month_today = (date.getMonth() + 1);
    day_today = date.getDate();
    meekatToday = jsonData[month_today][day_today];
    
    const location = req.params.place;




    fajrStart =  meekatToday.fajrStart ;
    let [fajrhours, fajrminutes] = fajrStart.split(':');
    let fajrTime = new Date();
    fajrTime.setHours(parseInt(fajrhours, 10));
    fajrTime.setMinutes(parseInt(fajrminutes, 10));

    zuhrStart =  meekatToday.zuhrStart    ;  
    let [zuhrhours, zuhrminutes] = zuhrStart.split(':');
    let zuhrTime = new Date();
    zuhrTime.setHours(parseInt(zuhrhours, 10));
    zuhrTime.setMinutes(parseInt(zuhrminutes, 10));
    
    asrStart =  meekatToday.asrStart      ; 
    let [asrhours, asrminutes] = asrStart.split(':');
    let asrTime = new Date();
    asrTime.setHours(parseInt(asrhours, 10));
    asrTime.setMinutes(parseInt(asrminutes, 10));
    
    magribStart =  meekatToday.magribStart;
    let [magribhours, magribminutes] = magribStart.split(':');
    let magribTime = new Date();
    magribTime.setHours(parseInt(magribhours, 10));
    magribTime.setMinutes(parseInt(magribminutes, 10));
    
    ishaStart =  meekatToday.ishaStart    ;  
    let [ishahours, ishaminutes] = ishaStart.split(':');
    let ishaTime = new Date();
    ishaTime.setHours(parseInt(ishahours, 10));
    ishaTime.setMinutes(parseInt(ishaminutes, 10));

    tuluAftab =  meekatToday.tuluAftab    ;
    let [tuluhours, tuluminutes] = tuluAftab.split(':');
    let tuluTime = new Date();
    tuluTime.setHours(parseInt(tuluhours, 10));
    tuluTime.setMinutes(parseInt(tuluminutes, 10));
    
    nisfNahar =  meekatToday.nisfNahar    ;
    let [nisfhours, nisfminutes] = nisfNahar.split(':');
    let nisfTime = new Date();
    nisfTime.setHours(parseInt(nisfhours, 10));
    nisfTime.setMinutes(parseInt(nisfminutes, 10));     



    switch(location){
        
        case "Uri":
            fajrTime.setMinutes(fajrTime.getMinutes() +     3);
            zuhrTime.setMinutes(zuhrTime.getMinutes() +     3);
            asrTime.setMinutes(asrTime.getMinutes() +       3);
            magribTime.setMinutes(magribTime.getMinutes() + 3);
            ishaTime.setMinutes(ishaTime.getMinutes() +     3);
            tuluTime.setMinutes(tuluTime.getMinutes() +     3);
            nisfTime.setMinutes(nisfTime.getMinutes() +     3);
            break;

        case "Baramulla":
        case "Tangmarg":
        case "Sopore":
            fajrTime.setMinutes(fajrTime.getMinutes() +     1);
            zuhrTime.setMinutes(zuhrTime.getMinutes() +     1);
            asrTime.setMinutes(asrTime.getMinutes() +       1);
            magribTime.setMinutes(magribTime.getMinutes() + 1);
            ishaTime.setMinutes(ishaTime.getMinutes() +     1);
            tuluTime.setMinutes(tuluTime.getMinutes() +     1);
            nisfTime.setMinutes(nisfTime.getMinutes() +     1);
            break;
        
        case "Bandipora":
        case "Punch":
            fajrTime.setMinutes(fajrTime.getMinutes() +     2);
            zuhrTime.setMinutes(zuhrTime.getMinutes() +     2);
            asrTime.setMinutes(asrTime.getMinutes() +       2);
            magribTime.setMinutes(magribTime.getMinutes() + 2);
            ishaTime.setMinutes(ishaTime.getMinutes() +     2);
            tuluTime.setMinutes(tuluTime.getMinutes() +     2);
            nisfTime.setMinutes(nisfTime.getMinutes() +     2);
            break;

        case "Teetwal":
        case "Karna":
            fajrTime.setMinutes(fajrTime.getMinutes() +     4);
            zuhrTime.setMinutes(zuhrTime.getMinutes() +     4);
            asrTime.setMinutes(asrTime.getMinutes() +       4);
            magribTime.setMinutes(magribTime.getMinutes() + 4);
            ishaTime.setMinutes(ishaTime.getMinutes() +     4);
            tuluTime.setMinutes(tuluTime.getMinutes() +     4);
            nisfTime.setMinutes(nisfTime.getMinutes() +     4);
            break;

        case "IslamAbad":
        case "Tral":
            fajrTime.setMinutes(fajrTime.getMinutes() -     2);
            zuhrTime.setMinutes(zuhrTime.getMinutes() -     2);
            asrTime.setMinutes(asrTime.getMinutes() -       2);
            magribTime.setMinutes(magribTime.getMinutes() - 2);
            ishaTime.setMinutes(ishaTime.getMinutes() -     2);
            tuluTime.setMinutes(tuluTime.getMinutes() -     2);
            nisfTime.setMinutes(nisfTime.getMinutes() -     2);
            break;
        
        case "Pulwama":
        case "Kulgam":
        case "Harmukh":
            fajrTime.setMinutes(fajrTime.getMinutes() -     1);
            zuhrTime.setMinutes(zuhrTime.getMinutes() -     1);
            asrTime.setMinutes(asrTime.getMinutes() -       1);
            magribTime.setMinutes(magribTime.getMinutes() - 1);
            ishaTime.setMinutes(ishaTime.getMinutes() -     1);
            tuluTime.setMinutes(tuluTime.getMinutes() -     1);
            nisfTime.setMinutes(nisfTime.getMinutes() -     1);
            break;

        case "Leh":
            fajrTime.setMinutes(fajrTime.getMinutes() -     11);
            zuhrTime.setMinutes(zuhrTime.getMinutes() -     11);
            asrTime.setMinutes(asrTime.getMinutes() -       11);
            magribTime.setMinutes(magribTime.getMinutes() - 11);
            ishaTime.setMinutes(ishaTime.getMinutes() -     11);
            tuluTime.setMinutes(tuluTime.getMinutes() -     11);
            nisfTime.setMinutes(nisfTime.getMinutes() -     11);
            break;

        case "Pahalgam":
            fajrTime.setMinutes(fajrTime.getMinutes() -     3);
            zuhrTime.setMinutes(zuhrTime.getMinutes() -     3);
            asrTime.setMinutes(asrTime.getMinutes() -       3);
            magribTime.setMinutes(magribTime.getMinutes() - 3);
            ishaTime.setMinutes(ishaTime.getMinutes() -     3);
            tuluTime.setMinutes(tuluTime.getMinutes() -     3);
            nisfTime.setMinutes(nisfTime.getMinutes() -     3);
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

    switch(location){
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

app.listen(3000, () => {
    console.log("Server is  up and running on port 3000");
});
