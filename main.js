const axios = require('axios');
const fs = require('fs');

const API = "https://api-pub.bitfinex.com/v2/";
const INTERVAL = 6100;
const DEFAULT_SYMBOL = "tETHUSD";
const PERIOD = "1m"

let lasttime = 0;
let interval = null;

main();


async function main()
{
    console.log(process.argv);

    let argv = process.argv;

    if (argv.length < 3)
        return;

    let action = argv[2];
    let symbol = argv.length >= 3 ? argv[3] : DEFAULT_SYMBOL;
    lasttime = argv.length >= 4 ? parseInt(argv[4]) : 0;

    switch (action.toLowerCase())
    {
        case "leech":
            interval = setInterval(async () => await getCandles(symbol), INTERVAL)
            break;
    }

}

async function getCandles(symbol)
{
    try 
    {
        const url = API + "candles/trade:" + PERIOD + ":" + symbol + "/hist?start=" + lasttime + "&sort=1&limit=9999";
        const response = await axios.get(url);
        const candles = response.data;
        for (let i = 0; i < candles.length ; i++)
        {
            let time = candles[i][0]
            
            if (isToday(time))
            {
                clearInterval(interval);
                console.log("done!");
                return;
            }

            if (time <= lasttime)
                continue;
    
            saveOCHL(symbol, candles[i][0], candles[i][1], candles[i][2], candles[i][3], candles[i][4], candles[i][5]);
        }
    }
    catch (e)
    {
        console.error(e);
    }
}

function isToday(timestamp)
{
    let today = new Date();
    let time = new Date(timestamp);
    time = time.setHours(0, 0, 0, 0);
    today = today.setHours(0, 0, 0, 0);
    return time == today;
}

async function saveOCHL(symbol, time, o, c, h, l, v)
{
    if (time <= lasttime)
        return;

    if (!fs.existsSync(symbol))
        fs.mkdirSync(symbol);

    lasttime = time;
    let now = new Date(time);
    let file = symbol + "/" + now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0') + ".csv";
    let data = time + ";" + o + ";" + c + ";" + h + ";" + l + ";" + v;
    console.log(data);
    fs.appendFileSync(file, data + "\n");
}

// function getTimestamp()
// {   
//     let timestamp = symbol + "/timestamp";
//     if (!fs.existsSync(timestamp))
//         return 0;
//     return parseInt(fs.readFileSync(timestamp));
// }

// function saveTimestamp()
// {
//     let timestamp = symbol + "/timestamp";
//     fs.writeFileSync(timestamp, lasttime);
// }
