// node covidData.js --source=https://www.mohfw.gov.in/ --dest=data

let minimist = require("minimist");
let fs = require("fs");
let axios = require("axios");
let jsdom = require("jsdom");
let pdf = require("pdf-lib");
// let p2j = require("pdf2pic");
// const { resolve } = require("path");
let p2i = require("pdftoimage");
// const { Poppler } = require("node-poppler");



let args = minimist(process.argv);

let responseKaPromise = axios.get("https://www.mohfw.gov.in/");

responseKaPromise.then(function(response){
    let html =  response.data;
   
    let dom = new jsdom.JSDOM(html);

    let document = dom.window.document;
    // object to create json
    

    
    let siteStatCount = document.querySelectorAll("div.site-stats-count > ul > li");
    // for(let i = 0; i<siteStatCount.length; i++){
    //     // console.log(siteStatCount[i].querySelectorAll("strong")[1].textContent.split("(")[0]);  // textContent for fething  text 
    // }

    
    let covidStats = {
        
        activeCase: siteStatCount[0].querySelectorAll("strong")[1].textContent.split("(")[0].trim() ,
        recovered: siteStatCount[1].querySelectorAll("strong")[1].textContent.split("(")[0].trim(),
        deaths: siteStatCount[2].querySelectorAll("strong")[1].textContent.split("(")[0].trim(),
        time: document.querySelector("h5 > span").textContent.split("(")[0].split(" : ")[1].trim()
    }
    //console.log(covidStats);
    let pdfBytes =  fs.readFileSync("canvas.pdf");
    let pdfPromise = pdf.PDFDocument.load(pdfBytes);
    pdfPromise.then(function(pdfdoc){
        let page = pdfdoc.getPage(0);
        page.drawText("Latest update:\n"+covidStats.time, {
            x:500,
            y:550,
            size: 16,
            color: pdf.rgb(1, 1, 1)
        })
        page.drawText(covidStats.activeCase,{
            x:80,
            y:400,
            size: 36,
            color: pdf.rgb(0.3,0.2,0.6)
        })
        page.drawText(covidStats.deaths,{
            x:80,
            y:325,
            size: 36,
            color: pdf.rgb(0.9,0.1,0.1)
        })
        page.drawText(covidStats.recovered,{
            x:80,
            y:250,
            size: 36,
            color: pdf.rgb(0.5,0.7,0.5)
        })

        let finalPdf = pdfdoc.save();
        finalPdf.then(function(finalBytes){
            fs.writeFileSync("final.pdf",finalBytes);
        })
    })

    // let options = {
    //     density: 100,
    //     saveFilename: "covidStatus.jpeg",
    //     format:"jpg"
    // }
    // let pdf2jpg = p2j.fromPath("final.pdf",options);
    // pdf2jpg(1).then(function(resolve){
    //     console.log("jpg created");
    // })
 
    let file =  "final.pdf";
    console.log("DOne");
    p2i(file, {
        format: 'jpeg',  // png, jpeg, tiff or svg, defaults to png
        prefix: 'img'  // prefix for each image except svg, defaults to input filename\
      
      }).then(function(){
        console.log('Conversion done');
      })
      .catch(function(err){
        console.log(err);
      });
    

}).catch(function(err){
    console.log("error hai bhaiya reponse promise me");
})





