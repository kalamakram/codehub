const cds = require('@sap/cds');
const express = require('express');

cds.on('bootstrap', app => {
    // Increase payload size limit
    app.use(express.json({ 
        limit: '50mb',
        extended: true,
        parameterLimit: 50000
    }));
    
    app.use(express.urlencoded({ 
        limit: '50mb', 
        extended: true,
        parameterLimit: 50000
    }));

    // Set timeout
    app.use((req, res, next) => {
        res.setTimeout(300000); // 5 minutes
        next();
    });
});

module.exports = cds.server;