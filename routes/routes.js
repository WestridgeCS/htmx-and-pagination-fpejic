import express from 'express';
import mongoose from 'mongoose';
import Person from '../models/Person.js';

const router = express.Router();

// TODO: write a helper function isHX(req) that returns true if request is from HTMX

function isHX(req) {
  return req.get('HX-Request') === 'true'
}

async function getPagedPeople(page, limit) {
  // TODO:
  // 1) Make sure page is a number >= 1
  // 2) Make sure limit is <= 50
  // 3) Compute skip
  // 4) Query total count AND the people list
  // 5) Sort by last name, then first name
  // 6) Apply skip and limit
  // 7) Compute totalPages
  // 8) Return an object: { people, total, page, limit, totalPages }
const safePage = Math.max(1, Number(page) || 1);
const safeLimit = Math.max( 1, Math.min (50, Number(limit) || 10));
const skip = safeLimit* (safePage-1);

const people = await Person.find().sort({ last: 1, first: 1 }).skip(skip).limit(safeLimit);
const total = await Person.countDocuments();

const totalPages = Math.max(1, Math.ceil(total/safeLimit));

  return {
    people,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages
  };
  
}

// GET /people (index shell OR table partial)
router.get('/', async (req, res, next) => {
  try {
    // TODO: call getPagedPeople using req.query.page and limit 10
const data = await getPagedPeople(req.query.page, 10);
    // TODO: if request is HTMX, render the table partial only
if (isHX(req)){
  res.render('_table', {...data});
}
    // TODO: otherwise render the full index page and pass data

    res.render('index', {...data});
  } catch (err) {
    next(err);
  }
});

// POST /people/seed (fetch 20 from randomuser.me, store in Mongo)
router.post('/seed', async (req, res, next) => {
  try {
    // TODO:
    // 1) fetch from: https://randomuser.me/api/?results=20&nat=us
    // 2) parse JSON
    // 3) map results into Person docs { first, last, email, phone, city, state, avatar }
    // 4) clear the collection (deleteMany({}))
    // 5) insertMany(docs)
    // 6) get page 1 data (10 per page)
    // 7) if HTMX: render people/_table with page 1
    // 8) else redirect to /people
    const response = await fetch('https://randomuser.me/api/?results=20');
    const json = await response.json();

    const docs = json.results.map( u => ({
      first: u.name.first,
      last:  u.name.last,
      email:  u.email,
      phone: u.phone,
      city: u.location.city,
      state: u.location.state,
      avatar: u.picture.thumbnail
    }))

    Person.insertMany(docs);
    const data = await getPagedPeople(1, 10);

    res.redirect('/people');
  } catch (err) {
    next(err);
  }
});

// GET /people/:id (show partial only)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // if id is not a valid ObjectId, return 404
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send('Not found');
    }

    // TODO: find the person by id
    const person = await Person.findById(id);

    // TODO: if not found, return 404
    if (!person) return res.status(404).send('Not found');
    // TODO: render the show partial and pass person
    res.render('_show', {person});

    res.send('TODO: build GET /people/:id');
  } catch (err) {
    next(err);
  }
});

export default router;
