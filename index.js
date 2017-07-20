require('dotenv').config()
const { FEBL_ACCESS_TOKEN, DISTANCE } = process.env
const DATEFORMAT = 'MMMM D YYYY'

const express     = require('express')
const app         = express()
const http        = require('http').Server(app)
const pug         = require('pug')
const EventSearch = require('facebook-events-by-location-core')
const locations   = require('./cities')
const moment      = require('moment')
const csv         = require('express-csv')

const mapCityData = (cities, keywords) => {
  let cityData = []

  return new Promise((resolve, reject) => {
    const cityData = []
    cities.map((city, index) => {
      const { name, coords } = city
      const { lat, lng } = coords
      const eventSearch = new EventSearch({
        lat,
        lng,
        distance: DISTANCE,
        accessToken: FEBL_ACCESS_TOKEN
      })

      eventSearch.search().then(data => {
        const { events } = data

        const filteredEvents = events.filter(event => {
          return keywords.some(keyword => {
            return event.name.toUpperCase().includes(keyword.toUpperCase())
          })
        })

        const sortedEvents = filteredEvents.sort((a, b) => {
          return new Date(a.startTime) - new Date(b.startTime)
        }).map(event => {
          return Object.assign({}, event, {
            startTime: moment(event.startTime).format(DATEFORMAT),
            endTime:   moment(event.endTime).format(DATEFORMAT)
          })
        })

        cityData.push({
          name,
          events: sortedEvents
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
    res.status(200).render('region', {
      location,
      keywords,
      cityData
    })
  })
  .catch(err => {
    res.status(500).render('500', { err })
  })
})

app.get('/:location/:kw/csv', (req, res) => {
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
    const events = [{
      'Name',
      'Start Time',
      'End Time',
      'Category'
      'City',
      'Location',
      `Visitor Count (as of ${moment.format('MMM D')})`,
      'Contact Email',
      'Event URL'
    }]

    cityData.map(city => {
      city.events.map(event => {
        const { name, startTime, endTime, stats, id, venue, category } = event
        const { attending } = stats
        const url = `https://facebook.com/events/${id}`
        events.push({
          name,
          startTime,
          endTime,
          category,
          city: city.name,
          location: venue.name,
          visitorCount: attending,
          contact: venue.emails || '',
          url,
        })
      })
    })

    res.csv(events)

  })
  .catch(err => {
    res.status(500).render('500', { err })
  })
})

http.listen(process.env.PORT || 3000, () => {
  console.log(FEBL_ACCESS_TOKEN)
})
