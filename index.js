const express = require('express');
const http = require('http');
const path = require('path');
const app = require('./server/index.js');

const server = http.createServer(app);
const PORT = process.env.PORT || 5002;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [ROOT_PROXY] Server running on port ${PORT}`);
});
