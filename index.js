const browserObject = require('./browser');
const scraperController = require('./pageController');
const express = require('express')
const path = require('path')
const config = require('config')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


const {Router} = require('express')
const router = Router()
const app = express()
const PORT = config.get('port') || 5000

app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));


if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'Client', 'build')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'Client', 'build', 'index.html'))
  })
}


async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    app.listen(PORT, () => console.log(`App started on port ${PORT}...`))
    let browserInstance = browserObject.startBrowser();
    await scraperController(browserInstance)
  } catch (e) {
    console.log('Server Error', e.message)
    process.exit(1)
  }
}

start()
