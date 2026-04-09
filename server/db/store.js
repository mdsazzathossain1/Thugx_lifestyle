/**
 * JSON File-based Data Store - Mongoose-compatible API
 * Works without MongoDB. Data persists to /server/db/data/*.json
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function getNestedVal(obj, key) {
  return key.split('.').reduce((o, k) => (o != null && o[k] !== undefined ? o[k] : undefined), obj);
}
function applySort(arr, s) {
  return [...arr].sort((a, b) => {
    for (const [k, d] of Object.entries(s)) {
      const av = getNestedVal(a, k); const bv = getNestedVal(b, k);
      if (av < bv) return d === 1 ? -1 : 1;
      if (av > bv) return d === 1 ? 1 : -1;
    }
    return 0;
  });
}
function matchQuery(item, q) {
  for (const key of Object.keys(q)) {
    if (key === '$or') { if (!q['$or'].some(s => matchQuery(item, s))) return false; continue; }
    if (key === '$and') { if (!q['$and'].every(s => matchQuery(item, s))) return false; continue; }
    const val = q[key]; const iv = getNestedVal(item, key);
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('$regex' in val) { if (!new RegExp(val['$regex'], val['$options'] || '').test(String(iv || ''))) return false; continue; }
      if ('$in' in val) { if (!val['$in'].includes(iv)) return false; continue; }
      if ('$nin' in val) { if (val['$nin'].includes(iv)) return false; continue; }
      if ('$ne' in val) { if (iv === val['$ne']) return false; continue; }
      if ('$gte' in val || '$lte' in val || '$gt' in val || '$lt' in val) {
        const toComp = (x) => (x instanceof Date ? x.toISOString() : x);
        const a = toComp(iv); const cmpVal = (k) => toComp(val[k]);
        if ('$gte' in val && a < cmpVal('$gte')) return false;
        if ('$lte' in val && a > cmpVal('$lte')) return false;
        if ('$gt' in val && a <= cmpVal('$gt')) return false;
        if ('$lt' in val && a >= cmpVal('$lt')) return false;
        continue;
      }
    }
    if (iv !== val) return false;
  }
  return true;
}

class Document {
  constructor(raw, col) { this._col = col; Object.assign(this, deepClone(raw)); }
  async comparePassword(c) { 
    console.log('\n📝 Document.comparePassword() called');
    console.log('Input password:', c, 'length:', c.length);
    console.log('Stored password:', this.password.substring(0, 30) + '...');
    console.log('Stored password length:', this.password.length);
    try {
      const result = await bcrypt.compare(c, this.password);
      console.log('bcrypt.compare result:', result);
      return result;
    } catch (err) {
      console.error('❌ bcrypt.compare ERROR:', err.message);
      throw err;
    }
  }
  async save() { const r = this._toRaw(); this._col._updateById(r._id, r); return this; }
  toObject() { return this._toRaw(); }
  _toRaw() { const o = {}; for (const k of Object.keys(this)) { if (k !== '_col') o[k] = this[k]; } return o; }
  select() { return this; }
  populate() { return this; }
}

class QueryResult {
  constructor(items, col) { this._items = items; this._col = col; this._s = null; this._sk = 0; this._lim = null; }
  sort(s) { this._s = s; return this; }
  skip(n) { this._sk = parseInt(n) || 0; return this; }
  limit(n) { this._lim = parseInt(n); return this; }
  select() { return this; }
  populate() { return this; }
  _resolve() {
    let d = [...this._items];
    if (this._s) d = applySort(d, this._s);
    if (this._sk) d = d.slice(this._sk);
    if (this._lim !== null) d = d.slice(0, this._lim);
    return d.map(x => new Document(x, this._col));
  }
  then(res, rej) { try { res(this._resolve()); } catch (e) { rej(e); } }
  catch(rej) { return this.then(undefined, rej); }
}

class Collection {
  constructor(name) {
    this.name = name;
    this._file = path.join(DATA_DIR, name + '.json');
    this._data = this._load();
  }
  _load() { try { if (fs.existsSync(this._file)) return JSON.parse(fs.readFileSync(this._file, 'utf-8')); } catch (e) {} return []; }
  _save() { fs.writeFileSync(this._file, JSON.stringify(this._data, null, 2)); }
  _updateById(id, raw) {
    const i = this._data.findIndex(x => x._id === id);
    if (i !== -1) { this._data[i] = { ...raw, updatedAt: new Date().toISOString() }; this._save(); }
  }
  find(q = {}) {
    const items = Object.keys(q).length === 0 ? [...this._data] : this._data.filter(x => matchQuery(x, q));
    return new QueryResult(items, this);
  }
  async findOne(q = {}) { const r = this._data.find(x => matchQuery(x, q)); return r ? new Document(r, this) : null; }
  async findById(id) { const r = this._data.find(x => x._id === String(id)); return r ? new Document(r, this) : null; }
  async create(data) {
    const doc = { _id: generateId(), ...deepClone(data), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this._data.push(doc); this._save(); return new Document(doc, this);
  }
  async findByIdAndUpdate(id, update, opts = {}) {
    const i = this._data.findIndex(x => x._id === String(id)); if (i === -1) return null;
    const $s = update['$set'] || (update['$inc'] || update['$push'] ? {} : update);
    const $inc = update['$inc'] || {}; const $push = update['$push'] || {};
    this._data[i] = { ...this._data[i], ...$s, updatedAt: new Date().toISOString() };
    for (const [k, v] of Object.entries($inc)) { this._data[i][k] = (this._data[i][k] || 0) + v; }
    for (const [k, v] of Object.entries($push)) { if (!Array.isArray(this._data[i][k])) this._data[i][k] = []; this._data[i][k].push(v); }
    this._save(); return new Document(this._data[i], this);
  }
  async findByIdAndDelete(id) {
    const i = this._data.findIndex(x => x._id === String(id)); if (i === -1) return null;
    const [d] = this._data.splice(i, 1); this._save(); return new Document(d, this);
  }
  async countDocuments(q = {}) {
    return Object.keys(q).length === 0 ? this._data.length : this._data.filter(x => matchQuery(x, q)).length;
  }
  async aggregate(pipeline) {
    let r = deepClone(this._data);
    for (const stage of pipeline) {
      if (stage['$match']) r = r.filter(x => matchQuery(x, stage['$match']));
      if (stage['$group']) {
        const acc = { _id: null };
        for (const item of r) {
          for (const [f, ex] of Object.entries(stage['$group'])) {
            if (f === '_id') continue;
            if (ex['$sum'] !== undefined) {
              const v = typeof ex['$sum'] === 'string' ? (getNestedVal(item, ex['$sum'].replace('$', '')) || 0) : ex['$sum'];
              acc[f] = (acc[f] || 0) + Number(v);
            }
          }
        }
        r = r.length > 0 ? [acc] : [];
      }
      if (stage['$sort']) r = applySort(r, stage['$sort']);
      if (stage['$limit']) r = r.slice(0, stage['$limit']);
    }
    return r;
  }
}

const _cols = {};
function getCollection(name) { if (!_cols[name]) _cols[name] = new Collection(name); return _cols[name]; }
module.exports = { getCollection, generateId };