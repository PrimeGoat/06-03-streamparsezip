// A CSV file is a file with Comma Separated Values
// The first row specifies the data types, the rows following are the data
// create a server
// read the data from the csv file
// create a json file for the males, males.json
// create a json file for the females, females.json
// on '/' route put out simple html page saying Welcome to Male & Female Parser'
// on '/males' route should show all the males but in json
// on '/females' route should show all females but in json
// use streams and piping to output /males and /females routes
// using docs above you may have to adjust option flags for your streaming depending on how you code your app
// parse the data to write to the males.json if it is male or females.json if it is femaile
// the json file is not required to persist, but should be able to be output into the browser
// make zip file of the males.json: malezipfile.json.gz
// make a zip file of the females.json: femalezipfile.json.gz
// use the zlib doc to figure out how
// if the route does not exist create a 404.html page for it to default to
// if you can't use streams find any way to parse and place the data without hard coding the data from the file
// HINT: possible to solve just using the .on('data') and .on('end') events from streams
// This is a brute force exercise, i.e. just get it to work
// It is possible to have to delete the .json files after creating them in your code. (not required though)
// Make sure the .json file outputs in the browser are only 4 people for male in /males and 4 for female in /females

const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');
const zlib = require('zlib');


// Default data in case user tries to load the page before csv parsing is complete
let jsonMales = '{"Message":"Please try again in a moment."}';
let jsonFemales = '{"Message":"Please try again in a moment."}';

// Parse csv file
const results = [];
fs.createReadStream('data.csv')
.pipe(csv())
.on('data', (data) => results.push(data))
.on('end', () => {
    let males = [];
    let females = [];
    // Separate into male and female.  LGBTQ-incompatible
    for(entry of results) {
        if(entry.Gender == 'F')         females.push(entry);
        else if(entry.Gender == 'M')    males.push(entry);
    }
    jsonMales = JSON.stringify(males);
    jsonFemales = JSON.stringify(females);
    
    // Create buffers for file processing
    let maleBuf = Buffer.from(jsonMales, 'utf8');
    let femaleBuf = Buffer.from(jsonFemales, 'utf8');

    // write output files
    fs.writeFileSync("females.json", femaleBuf);
    fs.writeFileSync("males.json", maleBuf);
    fs.writeFileSync("malezipfile.json.gz", zlib.gzipSync(maleBuf));
    fs.writeFileSync("femalezipfile.json.gz", zlib.gzipSync(femaleBuf));
});


const server = http.createServer((req, res) => {
    console.log("Incoming request: " + req.url);
    let readStream;

    // determine request route
    switch(req.url) {
        case "/index.html":
        case "/index":
        case "/":
            // main site
            res.writeHead(200, { 'Content-Type': 'text/html' });
            readStream = fs.createReadStream('./index.html', 'utf8');
            readStream.pipe(res);
            break;
        case "/females":
        case "/females.json":
            // females json
            res.writeHead(200, { 'Content-Type': 'application/json' });
            readStream = fs.createReadStream('./females.json');
            readStream.pipe(res);
            break;
        case "/males":
        case "/males.json":
            // males json
            res.writeHead(200, { 'Content-Type': 'application/json' });
            readStream = fs.createReadStream('./males.json');
            readStream.pipe(res);
            break;
        case "/malezipfile.json.gz":
            // male gzip
            res.writeHead(200, { 'Content-Type': 'application/gzip' });
            readStream = fs.createReadStream('./malezipfile.json.gz');
            readStream.pipe(res);
            break;
        case "/femalezipfile.json.gz":
            // fenale gzip
            res.writeHead(200, { 'Content-Type': 'application/gzip' });
            readStream = fs.createReadStream('./femalezipfile.json.gz');
            readStream.pipe(res);
            break;
        default:
            // not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            readStream = fs.createReadStream('./404.html', 'utf8');
            readStream.pipe(res);
            break;
    }
});

// start listening
server.listen(3000, (msg) => {
    console.log("Listening to port 3000");
});
