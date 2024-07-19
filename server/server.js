const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exec } = require('child_process');
const json2xls = require('json2xls');

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/server', express.static(path.join(__dirname, 'server')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/api/diecast', (req, res) => {
    fs.readFile('./MockDataJS.json', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        res.json(JSON.parse(data));
    });
});

app.get('/api/wishlist', (req, res) => {
    fs.readFile('./wishlist.json', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        let wishlist = JSON.parse(data);
        // Ensure numeric fields are parsed as integers
        wishlist = wishlist.map(item => ({
            ...item,
            ID: parseInt(item.ID, 10),
            BYEAR: parseInt(item.BYEAR, 10),
            YEAR: parseInt(item.YEAR, 10)
        }));
        res.json(wishlist);
    });
});

app.get('/api/diecast/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = './MockDataJS.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        const diecasts = JSON.parse(data);
        const diecast = diecasts.find(d => d.ID === id);

        if (!diecast) {
            console.error(`Item with ID ${id} not found`);
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json(diecast);
    });
});

app.get('/api/wishlist/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = './wishlist.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        const wishlist = JSON.parse(data);
        const item = wishlist.find(d => d.ID === id);

        if (!item) {
            console.error(`Item with ID ${id} not found`);
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json(item);
    });
});

app.post('/login', (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        req.session.user = username;
        res.redirect('/admin.html');
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/check-login', (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

app.post('/upload-excel', upload.single('excelFile'), (req, res) => {
    const filePath = req.file.path;
    const outputPath = './MockDataJS.json';
    const backupPath = './backup/MockDataJS.json';

    if (!fs.existsSync('./backup')) {
        fs.mkdirSync('./backup');
    }

    fs.copyFile(outputPath, backupPath, (err) => {
        if (err) {
            console.error('Error backing up file:', err);
            return res.status(500).send('Error backing up file');
        }

        exec(`python convert_to_json.py ${filePath} ${outputPath}`, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error}`);
                return res.status(500).send(`Error processing file: ${stderr}`);
            }

            fs.readFile(outputPath, (readErr, data) => {
                if (readErr) {
                    console.error('Error reading JSON file:', readErr);
                    return res.status(500).send('Error reading JSON file');
                }

                let diecastCollection;
                try {
                    diecastCollection = JSON.parse(data);
                } catch (parseErr) {
                    console.error('Error parsing JSON file:', parseErr);
                    return res.status(500).send('Error parsing JSON file');
                }

                diecastCollection = updateDupeColumn(diecastCollection);

                fs.writeFile(outputPath, JSON.stringify(diecastCollection, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing JSON file:', writeErr);
                        return res.status(500).send('Error writing JSON file');
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Error deleting file:', unlinkErr);
                            return res.status(500).send('Error deleting file');
                        }
                        res.send('File uploaded, processed, backed up, and deleted successfully');
                    });
                });
            });
        });
    });
});

app.get('/download-excel', (req, res) => {
    const jsonPath = './MockDataJS.json';
    const excelPath = './Master.xlsx';
    exec(`python json_to_excel.py ${jsonPath} ${excelPath}`, { windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).send(`Error processing file: ${stderr}`);
        }
        console.log('Download initiated for Master.xlsx');
        res.download(excelPath, 'Master.xlsx', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Error sending file');
            }
        });
    });
});

function updateDupeColumn(diecastCollection) {
    const columnsToCheck = ['BRAND', 'BYEAR', 'SET', 'MAKE', 'MODEL', 'YEAR', 'COLOR'];
    const seen = new Set();

    diecastCollection.forEach((item, index) => {
        const rowTuple = columnsToCheck.map(col => item[col]).join('|');
        
        if (seen.has(rowTuple)) {
            item.DUPE = 'Yes';
        } else {
            item.DUPE = 'No';
            seen.add(rowTuple);
        }
    });

    return diecastCollection;
}

app.post('/api/add-diecast', (req, res) => {
    const newDiecast = req.body;
    console.log('Received data:', newDiecast);
    const filePath = './MockDataJS.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, error: 'Error reading data' });
        }

        let diecastCollection;
        try {
            diecastCollection = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, error: 'Error parsing data' });
        }

        const maxId = diecastCollection.reduce((max, item) => Math.max(max, item.ID || 0), 0);
        newDiecast.ID = maxId + 1;

        const requiredFields = ['BRAND', 'BYEAR', 'SET', 'MAKE', 'MODEL', 'YEAR', 'COLOR', 'DUPE'];
        for (const field of requiredFields) {
            if (!newDiecast[field]) {
                return res.status(400).json({ success: false, error: `Missing required field: ${field}` });
            }
        }

        diecastCollection.push(newDiecast);

        diecastCollection = updateDupeColumn(diecastCollection);

        fs.writeFile(filePath, JSON.stringify(diecastCollection, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing JSON file:', writeErr);
                return res.status(500).json({ success: false, error: 'Error writing data' });
            }

            res.json({ success: true });
        });
    });
});

app.get('/api/highest-wishlist-id', (req, res) => {
    fs.readFile('./wishlist.json', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        const wishlist = JSON.parse(data);
        const highestId = wishlist.reduce((max, item) => Math.max(max, parseInt(item.ID, 10)), 0);
        res.json({ highestId });
    });
});

app.post('/api/add-wishlist', (req, res) => {
    const newItem = req.body;
    const filePath = './wishlist.json';

    // Parse year fields as integers
    newItem.BYEAR = parseInt(newItem.BYEAR, 10);
    newItem.YEAR = parseInt(newItem.YEAR, 10);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ success: false, error: 'Error reading data' });
        }

        let wishlist;
        try {
            wishlist = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, error: 'Error parsing data' });
        }

        const maxId = wishlist.reduce((max, item) => Math.max(max, parseInt(item.ID, 10)), 0);
        newItem.ID = maxId + 1;

        const requiredFields = ['BRAND', 'BYEAR', 'SET', 'MAKE', 'MODEL', 'YEAR', 'COLOR', 'DUPE'];
        for (const field of requiredFields) {
            if (!newItem[field]) {
                return res.status(400).json({ success: false, error: `Missing required field: ${field}` });
            }
        }

        wishlist.push(newItem);

        fs.writeFile(filePath, JSON.stringify(wishlist, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing JSON file:', writeErr);
                return res.status(500).json({ success: false, error: 'Error writing data' });
            }

            res.json({ success: true });
        });
    });
});

app.delete('/api/delete-diecast/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = './MockDataJS.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        let diecasts = JSON.parse(data);
        const index = diecasts.findIndex(diecast => diecast.ID === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        diecasts.splice(index, 1);

        diecasts = diecasts.map((diecast, idx) => ({ ...diecast, ID: idx + 1 }));

        fs.writeFile(filePath, JSON.stringify(diecasts, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, message: 'Error writing file' });
            }

            res.json({ success: true });
        });
    });
});

app.delete('/api/delete-wishlist/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = './wishlist.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        let wishlist = JSON.parse(data);
        const index = wishlist.findIndex(item => item.ID === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        wishlist.splice(index, 1);

        wishlist = wishlist.map((item, idx) => ({ ...item, ID: idx + 1 }));

        fs.writeFile(filePath, JSON.stringify(wishlist, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, message: 'Error writing file' });
            }

            res.json({ success: true });
        });
    });
});

app.put('/api/diecast/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedDiecast = req.body;
    const filePath = './MockDataJS.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        let diecasts = JSON.parse(data);
        const index = diecasts.findIndex(d => d.ID === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        diecasts[index] = updatedDiecast;

        fs.writeFile(filePath, JSON.stringify(diecasts, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, message: 'Error writing file' });
            }

            res.json({ success: true });
        });
    });
});

app.put('/api/wishlist/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedItem = req.body;
    const filePath = './wishlist.json';

    // Parse year fields as integers
    updatedItem.BYEAR = parseInt(updatedItem.BYEAR, 10);
    updatedItem.YEAR = parseInt(updatedItem.YEAR, 10);
    updatedItem.ID = parseInt(updatedItem.ID, 10); // Ensure ID is an integer

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        let wishlist;
        try {
            wishlist = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, error: 'Error parsing data' });
        }

        const index = wishlist.findIndex(d => d.ID === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        wishlist[index] = updatedItem;

        fs.writeFile(filePath, JSON.stringify(wishlist, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, message: 'Error writing file' });
            }

            res.json({ success: true });
        });
    });
});

app.get('/edit-item.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/edit/edit-item.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});