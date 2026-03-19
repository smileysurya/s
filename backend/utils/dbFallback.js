const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DBFallback {
    constructor(collectionName) {
        this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
        this.ensureFile();
    }

    ensureFile() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([]));
        }
    }

    _readData() {
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        } catch (e) {
            return [];
        }
    }

    _writeData(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    async find(query = {}) {
        const data = this._readData();
        const keys = Object.keys(query);
        if (keys.length === 0) return data;
        return data.filter(item => {
            for (let key of keys) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    }

    async findOne(query = {}) {
        const results = await this.find(query);
        return results[0] || null;
    }

    async save(item) {
        const data = this._readData();
        const newItem = {
            _id: item._id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newItem);
        this._writeData(data);
        return newItem;
    }

    async updateOne(query, updates) {
        const data = this._readData();
        const keys = Object.keys(query);
        let updated = null;
        for (let i = 0; i < data.length; i++) {
            let match = true;
            for (let key of keys) {
                if (data[i][key] !== query[key]) { match = false; break; }
            }
            if (match) {
                data[i] = { ...data[i], ...updates, updatedAt: new Date().toISOString() };
                updated = data[i];
                break;
            }
        }
        if (updated) this._writeData(data);
        return updated;
    }

    async deleteMany(query = {}) {
        const data = this._readData();
        const keys = Object.keys(query);

        // If no query keys, delete everything
        if (keys.length === 0) {
            this._writeData([]);
            return { deletedCount: data.length };
        }

        // Keep items that DON'T match the query
        const remaining = data.filter(item => {
            for (let key of keys) {
                if (item[key] !== query[key]) return true; // doesn't match, keep it
            }
            return false; // matches query, remove it
        });

        this._writeData(remaining);
        return { deletedCount: data.length - remaining.length };
    }
}

module.exports = (collection) => new DBFallback(collection);
