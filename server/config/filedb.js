const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class FileDB {
  constructor(name) {
    this.name = name;
    this.file = path.join(DB_DIR, `${name}.json`);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        return JSON.parse(fs.readFileSync(this.file, 'utf-8'));
      }
    } catch (err) {
      console.error(`Error loading ${this.name}:`, err.message);
    }
    return [];
  }

  save() {
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error(`Error saving ${this.name}:`, err.message);
    }
  }

  create(item) {
    item._id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    item.createdAt = new Date();
    item.updatedAt = new Date();
    this.data.push(item);
    this.save();
    return item;
  }

  findOne(query) {
    return this.data.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findById(id) {
    return this.data.find(item => item._id === id);
  }

  updateOne(query, update) {
    const item = this.findOne(query);
    if (item) {
      Object.assign(item, update);
      item.updatedAt = new Date();
      this.save();
    }
    return item;
  }

  deleteOne(query) {
    const index = this.data.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index > -1) {
      const deleted = this.data.splice(index, 1);
      this.save();
      return deleted[0];
    }
  }

  find(query = {}) {
    return this.data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  countDocuments(query = {}) {
    return this.find(query).length;
  }
}

module.exports = FileDB;
