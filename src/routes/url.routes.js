const express = require('express');
const EmailCtrl = require('../controllers/emailAlert.js');
const router = express.Router();

const schema_data = { "url": true, "ok": true, "statusCode": true, "canonical": true, "autoCanonical": true, "title": true, "description": true, "googlebot": true, "VI": true, "h": { "h1": [], "h2": [], "h3": [], "h4": [], "h5": [], "h6": [] }, "p": { "p": [] } }
const msgChange = { "msg": '' }
// Urls Model
const Urls = require('../models/urls');

// GET all URLS
router.get('/', async (req, res) => {
  const int = await Urls.find();
  res.json(int);
});

router.get('/changes/', async (req, res) => {
  const int = await Urls.find();
  const changes = []
  int.map(e => {
    e.changes.map((d, i) => {
      const fullDate = e.interaction[i].date.split('-')
      const allH = e.changes[i].h.h1.concat(e.changes[i].h.h2, e.changes[i].h.h3)
      const allP = e.changes[i].p.p
      const nH = []
      const nP = []
      d.date = fullDate.join('/');
      d.urlIndex = e.url
      allH.map(d => { d === true ? nH.push(true) : '' })
      allP.map(d => { d === true ? nP.push(true) : '' })
      d.h = JSON.stringify(e.changes[i].h).search('true') === -1 ? 0 : 1;
      d.p = JSON.stringify(e.changes[i].p).search('true') === -1 ? 0 : 1;
      d.url = JSON.stringify(e.changes[i].url).search('true') === -1 ? 0 : 1;
      d.canonical = JSON.stringify(e.changes[i].canonical).search('true') === -1 ? 0 : 1;
      d.autoCanonical = JSON.stringify(e.changes[i].autoCanonical).search('true') === -1 ? 0 : 1;
      d.title = JSON.stringify(e.changes[i].title).search('true') === -1 ? 0 : 1;
      d.description = JSON.stringify(e.changes[i].description).search('true') === -1 ? 0 : 1;
      d.statusCode = JSON.stringify(e.changes[i].statusCode).search('true') === -1 ? 0 : 1;
      d.ok = JSON.stringify(e.changes[i].ok).search('true') === -1 ? 0 : 1;
      d.googlebot = JSON.stringify(e.changes[i].googlebot).search('true') === -1 ? 0 : 1;
      d.VI = JSON.stringify(e.changes[i].VI).search('true') === -1 ? 0 : 1;
      d.nH = nH.length;
      d.nP = nP.length;

    })
    changes.push({ changes: e.changes })
  })
  res.json(changes);
});

// GET one URL
router.get('/:id', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  res.json(int);
});

// GET one URLS change
router.get('/changes/:id', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  int.changes.map((e, i) => {
    const date = int.interaction[i].date
    const allH = int.changes[i].h.h1.concat(int.changes[i].h.h2, int.changes[i].h.h3)
    const allP = int.changes[i].p.p
    const nH = []
    const nP = []
    const fullDate = date.split('-')
    allH.map(d => { d === true ? nH.push(true) : '' })
    allP.map(d => { d === true ? nP.push(true) : '' })
    e.h = JSON.stringify(int.changes[i].h).search('true') === -1 ? false : true;
    e.p = JSON.stringify(int.changes[i].p).search('true') === -1 ? false : true;
    e.nH = nH.length;
    e.nP = nP.length;
    e.date = fullDate.join('/');
    e.urlIndex = int.url;
  })
  const changes = { urlFinal: int.url, changes: int.changes }
  res.json(changes);
});

// GET one URL and one DAY
router.get('/:id/:date', async (req, res) => {
  const int = await Urls.find({ _id: req.params.id });
  const index = int[0].interaction.findIndex(e => e.date == req.params.date)
  const responde = { interaction: int[0].interaction[index], changes: int[0].changes[index] }
  res.json(responde);
});
// GET one URL and DAY to DAY
router.get('/:id/:dateI/:dateF', async (req, res) => {
  const int = await Urls.find({ _id: req.params.id });
  const index = int[0].interaction.findIndex(e => e.date == req.params.dateI)
  const indexF = int[0].interaction.findIndex(e => e.date == req.params.dateF)
  const responde = { interaction: int[0].interaction.slice(index, indexF + 1), changes: int[0].changes.slice(index, indexF + 1) }
  res.json(responde);
});

// ADD a new URL
router.post('/', async (req, res) => {
  const { url, interaction, changes } = req.body;
  const int = new Urls({ _id: url.replace(/\//g, '.'), url, interaction, changes: schema_data });

  // Email de alta url
  const msg = `<p>Le informamos que se ha dado de alta una nueva url: ${url}<p>`
  //EmailCtrl.sendEmail('', '', 'Se ha añadido una nueva url', msg)

  await int.save();
  res.json(int)
});

// UPDATE a URL
router.put('/:id/:total/:n', async (req, res) => {
  const int = await Urls.findById(req.params.id);
  let { url, interaction } = req.body;
  let nTotal = req.params.total;
  let n = req.params.n;
  nTotal = parseInt(nTotal);
  n = parseInt(n);
  await int.interaction.push(interaction[0])

  // Comprobación de datos detalle
  const data_actual = int.interaction[int.interaction.length - 1]
  const data_pasada = int.interaction[int.interaction.length - 2]
  const schema_cambios = { "url": true, "ok": true, "statusCode": true, "canonical": true, "autoCanonical": true, "title": true, "description": true, "googlebot": true, "VI": true, "h": { "h1": [], "h2": [], "h3": [], "h4": [], "h5": [], "h6": [] }, "p": { "p": [] } }
  Object.keys(schema_cambios).map(e => {
    if (typeof (data_actual[e]) === 'object') {
      Object.keys(data_actual[e]).map(j => data_actual[e][j].map((h, _h) => {
        if (data_pasada[e][j][_h]) {
          data_actual[e][j][_h] === data_pasada[e][j][_h] ? schema_cambios[e][j].push(false) : schema_cambios[e][j].push(true)
        }
      }))
    } else {
      data_actual[e] === data_pasada[e] ?
        schema_cambios[e] = false : schema_cambios[e] = true
    }
  })
  int.changes.push(schema_cambios)

  const msg = `
    <p>La propiedad que tenga el valor "true" es la que ha modificado su valor respecto a la vez anterior.</p>
    <p>La url que ha cmabiado es: <a href="${data_actual.url}" target="_blank" rel="noopener noreferrer">${data_actual.url}</a></p>
    <h2>Schema de monitorización</h2>
    <p><code>${JSON.stringify(data_actual)}</code></p>
    <h2>Schema de cambios</h2>
    <p><code>${JSON.stringify(schema_cambios)}</code></p>
  `
  msgChange.msg = msgChange.msg + msg
  if (nTotal === (n + 1)) {
    JSON.stringify(schema_cambios).search('true') === -1 ? console.log('NO CHANGES') : EmailCtrl.sendEmail('', '', 'Una url monitorizada ha cambiado', msgChange.msg);
  }

  let changes = int.changes
  interaction = int.interaction

  await Urls.findByIdAndUpdate(req.params.id, { url, interaction, changes });
  res.json(int);
});

module.exports = router;