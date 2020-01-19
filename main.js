const axios = require('axios');
const fs = require('fs');

const API = "https://api-pub.bitfinex.com/v2/";
const INTERVAL = 10000;
const LIMIT = 80;
const symbol = "tETHUSD";
const period = "1m"

let lasttime = 0;

main();


async function main()
{
    lasttime = getTimestamp();
    setInterval(async () => await getCandles(), INTERVAL)
}

async function getCandles()
{
    try 
    {
        const url = API + "candles/trade:" + period + ":" + symbol + "/hist?limit=" + LIMIT;
        const response = await axios.get(url);
        const candles = response.data;
        for (let i = candles.length - 1; i >= 0 ; i--)
        {
            let time = candles[i][0]
    
            if (time <= lasttime)
                continue;
    
            saveOCHL(candles[i][0], candles[i][1], candles[i][2], candles[i][3], candles[i][4], candles[i][5]);
        }
    }
    catch (e)
    {
        console.error(e);
    }
}

async function saveOCHL(time, o, c, h, l, v)
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
    saveTimestamp();
}

function getTimestamp()
{   
    let timestamp = symbol + "/timestamp";
    if (!fs.existsSync(timestamp))
        return 0;
    return parseInt(fs.readFileSync(timestamp));
}

function saveTimestamp()
{
    let timestamp = symbol + "/timestamp";
    fs.writeFileSync(timestamp, lasttime);
}
