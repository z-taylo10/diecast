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
    secret: process.env.SESSION_SECRET || 'your_secret_key',
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
    const filePath = path.join(__dirname, 'MockDataJS.json');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).send('Error parsing data');
        }
    });
});

app.get('/api/wishlist', (req, res) => {
    const filePath = path.join(__dirname, 'wishlist.json');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        try {
            let wishlist = JSON.parse(data);
            wishlist = wishlist.map(item => ({
                ...item,
                ID: parseInt(item.ID, 10),
                BYEAR: parseInt(item.BYEAR, 10),
                YEAR: parseInt(item.YEAR, 10)
            }));
            res.json(wishlist);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).send('Error parsing data');
        }
    });
});

app.get('/api/diecast/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = path.join(__dirname, 'MockDataJS.json');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        try {
            const diecasts = JSON.parse(data);
            const diecast = diecasts.find(d => d.ID === id);

            if (!diecast) {
                console.error(`Item with ID ${id} not found`);
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            res.json(diecast);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, message: 'Error parsing data' });
        }
    });
});

app.get('/api/wishlist/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = path.join(__dirname, 'wishlist.json');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }

        try {
            const wishlist = JSON.parse(data);
            const item = wishlist.find(d => d.ID === id);

            if (!item) {
                console.error(`Item with ID ${id} not found`);
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            res.json(item);
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).json({ success: false, message: 'Error parsing data' });
        }
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
    const outputPath = path.join(__dirname, 'MockDataJS.json');
    const backupPath = path.join(__dirname, 'backup/MockDataJS.json');
    const scriptPath = path.join(__dirname, 'convert_to_json.py');

    if (!fs.existsSync(path.join(__dirname, 'backup'))) {
        fs.mkdirSync(path.join(__dirname, 'backup'));
    }

    fs.copyFile(outputPath, backupPath, (err) => {
        if (err) {
            console.error('Error backing up file:', err);
            return res.status(500).send('Error backing up file');
        }

        exec(`python ${scriptPath} ${filePath} ${outputPath}`, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error}`);
                return res.status(500).send(`Error processing file: ${stderr}`);
            }

            console.log('Python script output:', stdout);
            console.error('Python script error output:', stderr);

            fs.readFile(outputPath, (readErr, data) => {
                if (readErr) {
                    console.error('Error reading JSON file:', readErr);
                    return res.status(500).send('Error reading JSON file');
                }

                let diecastCollection;
                try {
                    diecastCollection = JSON.parse(data);
                   // console.log('Data read from JSON file:', diecastCollection);
                } catch (parseErr) {
                    console.error('Error parsing JSON file:', parseErr);
                    return res.status(500).send('Error parsing JSON file');
                }

                diecastCollection = updateDupeColumn(diecastCollection);
                console.log('Data after updating DUPE column:', diecastCollection);

                fs.writeFile(outputPath, JSON.stringify(diecastCollection, null, 2), async (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing JSON file:', writeErr);
                        return res.status(500).send('Error writing JSON file');
                    }

                    console.log('File successfully written to:', outputPath);

                    try {
                        await pushToGitHub(outputPath, JSON.stringify(diecastCollection, null, 2));
                    } catch (err) {
                        console.error('Error pushing to GitHub:', err);
                        return res.status(500).send('Error pushing to GitHub');
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

async function pushToGitHub(filePath, content) {
    const repo = 'ztaylo10/diecast';
    const path = 'server/MockDataJS.json';
    const message = 'Update MockDataJS.json';
    const token = process.env.GITHUB_TOKEN;

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Dynamically import node-fetch
    const fetch = await import('node-fetch').then(mod => mod.default);

    // Get the SHA of the existing file
    const response = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    const data = await response.json();
    const sha = data.sha;

    // Update the file
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            content: Buffer.from(content).toString('base64'),
            sha,
        }),
    });

    if (!updateResponse.ok) {
        throw new Error(`Failed to update file: ${updateResponse.statusText}`);
    }

    console.log('File successfully pushed to GitHub');
}

app.get('/download-excel', (req, res) => {
    const jsonPath = path.join(__dirname, 'MockDataJS.json');
    const excelPath = path.join(__dirname, 'Master.xlsx');
    const scriptPath = path.join(__dirname, 'json_to_excel.py');

    exec(`python ${scriptPath} ${jsonPath} ${excelPath}`, { windowsHide: true }, (error, stdout, stderr) => {
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
        if (item.DUPE === 'Yes') {
            // Skip checking if DUPE is already manually set to 'Yes'
            return;
        }

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
    const filePath = path.join(__dirname, 'MockDataJS.json');

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
    const filePath = path.join(__dirname, 'wishlist.json');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Error reading data');
        }
        try {
            const wishlist = JSON.parse(data);
            const highestId = wishlist.reduce((max, item) => Math.max(max, parseInt(item.ID, 10)), 0);
            res.json({ highestId });
        } catch (parseErr) {
            console.error('Error parsing JSON file:', parseErr);
            return res.status(500).send('Error parsing data');
        }
    });
});

app.post('/api/add-wishlist', (req, res) => {
    const newItem = req.body;
    const filePath = path.join(__dirname, 'wishlist.json');

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
    const filePath = path.join(__dirname, 'MockDataJS.json');

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
    const filePath = path.join(__dirname, 'wishlist.json');

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
    const filePath = path.join(__dirname, 'MockDataJS.json');

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
    const filePath = path.join(__dirname, 'wishlist.json');

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