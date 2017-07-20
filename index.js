require('dotenv').config()
const { ACCESS_TOKEN, DISTANCE } = process.env

const express     = require('express')
const app         = express()
const http        = require('http').Server(app)
const pug         = require('pug')
const EventSearch = require('facebook-events-by-location-core')
const locations   = require('./cities')

const mapCityData = (cities, keywords) => {
  let cityData = []

  return new Promise((resolve, reject) => {
    const cityData = []
    cities.map((city, index) => {
      const { name, coords } = city
      const { lat, lng } = coords
      const es = new EventSearch({
        lat,
        lng,
        distance: DISTANCE,
        accessToken: ACCESS_TOKEN
      })

      es.search().then(data => {
        const { events } = data

        const filteredEvents = events.filter(event => {
          return keywords.some(keyword => {
            return event.name.toUpperCase().includes(keyword.toUpperCase())
          })
        })

        cityData.push({
          name,
          events: filteredEvents
        })

        if(cityData.length === cities.length){
          resolve(cityData)
        }

      }).catch(err => {
        reject(err)
      })
    })
  })
}

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.status(200).render('index')
})

app.get('/:location/:kw', (req, res) => {
  const location    = req.params.location
  const keywords    = req.params.kw.split(',')
  const cities      = locations[location]

  if(!cities){
    res.status(404).render('404', { message: `Location '${location}' doesn't exist`  })
  }

  if(!keywords.length){
    res.status(404).render('404', { message: `Provide a keyword` })
  }

  mapCityData(cities, keywords)
  .then(cityData => {
    res.status(200).render('index', {
      location,
      keywords,
      cityData
    })
  })
  .catch(err => {
    res.status(500).render('500', { err })
  })
})

http.listen(process.env.PORT || 3000, () => {
  console.log('')
})
