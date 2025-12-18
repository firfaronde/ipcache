const express = require('express');
const app = express();
const port = 3000;

cachedIps = new Map();

app.use(express.json());

app.get('/ip/:ip', (req, res) => {
    const ip = req.params.ip;

    if (cachedIps.has(ip)) {
        // console.log('Cache hit for IP:', ip);
        res.json(cachedIps.get(ip));
    } else {
        getIpInfo(ip).then(data => {
            if(data.status !== 'success') {
                return res.status(400).json(data);
            }
            let anon = data.proxy || data.hosting || false;
            let idata = {
                anon: anon,
                status: data.status,
                ip: ip,
            };
            cachedIps.set(ip, idata);
            res.json(idata);
        });
    }
});

app.get('/cached-ips/keys', (req, res) => {
    res.json(Array.from(cachedIps.keys()));
});

app.get('/cached-ips/values', (req, res) => {
    res.json(Array.from(cachedIps.values()));
});

app.get('/cached-ips/size', (req, res) => {
    res.json({ size: cachedIps.size });
});

app.get('/clear-cache', (req, res) => {
    cachedIps.clear();
    res.json({ status: 'success'})
});

async function getIpInfo(ip) {
    return fetch('http://ip-api.com/json/' + ip + '?fields=17023488').then(response => response.json());
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'failed', message: err.message });
});

app.listen(port, () => {
    console.log(`Listening at ${port}`);
});