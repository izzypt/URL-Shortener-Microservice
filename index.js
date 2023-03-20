require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://izzypt:Simaao65@cluster0.ptadg75.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
let urlModel;
const urlSchema = new Schema({
  originalUrl: { type: String, required: true, unique: true },
  shortUrl: Number,
});

urlModel = mongoose.model("urlModel", urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const findUrlByOriginal = (url, done) => {
  urlModel.findOne({originalUrl: url}, (err, modelFound) => {
    if (err) return console.log(err);
    done(null, modelFound);
  });
};


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const originalUrls = [];
const shortUrls = [];

app.post('/api/shorturl/', (req, res) => {
  const url = req.body.url;
  const foundIndex = originalUrls.indexOf(url)

  if (!url.includes('https://') && !url.includes('http://'))
    return res.json({'error': 'Invalid url'})

  if (foundIndex < 0)
  {
    originalUrls.push(url);
    shortUrls.push(shortUrls.length);

    return res.json({
      original_url : url,
      short_url : shortUrls.length - 1,
    })
  }

  return res.json({
    original_url: url,
    short_url: shortUrls[foundIndex]
  })
  /*console.log(req.method)
  console.log(req.body.url)
  findUrlByOriginal(req.body.url, (err, data) => {
    if (err) console.log(err)
    if (data.length > 0) 
    {
      console.log("Url exists: ", data)
      res.json({originalUrl: data.originalUrl})
    }
    else
    {
      console.log("Data does not exist: " + data)
      const newUrl = new urlModel({originalUrl:req.body.url})

      newUrl.save((err, data) => {
        if (err) console.log(err)
        else console.log("Saved: " + data)
      })
    }
  });*/
})

app.get('/api/shorturl/:short', (req, res) => {
  const shorturl = parseInt(req.params.short)
  const foundIndex =  shortUrls.indexOf(shorturl)

  if (foundIndex < 0){
    return res.json({'error' : 'No short url found for the given input'})
  }
  else res.redirect(originalUrls[foundIndex])
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
