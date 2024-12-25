const cds = require('@sap/cds');
const { Readable, PassThrough } = require('stream');
const { createHttpClient } = require("@sap-cloud-sdk/http-client");
//const { executeHttpRequest, DestinationHttpRequestConfig } = require("@sap-cloud-sdk/http-client");
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const axios = require('axios');


module.exports = cds.service.impl(function () {
    const { InvoiceDocuments } = this.entities;
    this.on('CREATE', InvoiceDocuments, async (req) => {
        const { fileContent, fileName, contentType, status } = req.data;
        if (!fileContent) {
            req.error(400, 'No file content provided.');
        }
       
        let binaryData;
        try {
            const stream = new PassThrough();
            const chunks = [];
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            stream.on('end', async () => {
                binaryData = Buffer.concat(chunks).toString('base64');
                // Insert into the database
                const id = cds.utils.uuid();
                const result = await INSERT.into(this.entities.InvoiceDocuments).entries({
                    ID: id,
                    fileContent: binaryData,
                    fileName,
                    contentType,
                    status
                });

                return result;
            });
            req.data.fileContent.pipe(stream);
        } catch (error) {
            req.error(400, 'Invalid base64 file content.');
        }
    });

    this.on('returnBase64', async (req) => {
        const { ID } = req.data;
        let query = cds.parse.cql(`SELECT fileContent from ${InvoiceDocuments} where ID = '${ID}'`);
        let fileObj = await cds.db.run(query);
        if (fileObj.length <= 0) {
            req.error(404, `File not found for Id ${ID}`);
            return;
        }
        const buffer = Buffer.from(fileObj[0].FILECONTENT);
        // Convert buffer to Base64
        const base64String = buffer.toString("base64");
        return base64String;
    });

    this.on("callOpenAIAPI", async (req) => {
        const { fileContent } = req.data;

        if (!fileContent) {
            req.error(400, "Missing file content.");
        }

 /*       const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: `Read the invoice number, PO number, gross amount, and payterms from this file and send the response in JSON format. <img src="data:application/pdf;base64,${fileContent}" />`
                }
            ],
            max_tokens: 512,
            temperature: 1.0,
            top_p: 1.0,
            stream: false
        };

        try {

            // Debug: Log available destinations
            console.log("Fetching destination: nvidia-api-destination");

            // Make a request to the destination
            const response = await executeHttpRequest(
                { destinationName: "nvidia_open_ai" },
                {
                    method: "POST",
                    url: "", // Leave blank since base URL is configured in destination
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: payload
                }
            );
      
            console.log("NVIDIA API Response:", response.data);
            return JSON.stringify(response.data);
        } */

            try {
                // OPENAI API URL
                const apiUrl = "https://sap-btp.rtdomain.in/api/v1/process/invoice";
    
                // API Key (You can load this from environment variables or a secure config file)
                const apiKey = "";
    
                // API Request Headers
                const headers = {
                    "Authorization": "No Auth",
                    "Content-Type": "application/json",
                };
    
                // API Payload
                const payload = {
                            "file_name": "file.pdf",
                            "base64_string": fileContent
                };
    
                // Make API Call
                const response = await axios.post(apiUrl, payload, { headers });
    
                // Return Response to Frontend
                return JSON.stringify(response.data);
                console.log("API Response:", response.data);
            } catch (error) {
            console.error("Error calling OPEN AI API:", error.message);
            req.error(500, "Failed to process OPEN AI API request.");
        }
    });

    this.on("fetchRelevantPOs", async (req) => {
        const { purchaseOrder, invoiceNumber } = req.data;
    
        if (!purchaseOrder && !invoiceNumber) {
            req.error(400, "Missing purchase order or invoice number.");
        }
    
        // Mock data for POs (replace with actual ERP OData call)
        const mockPOs = [
            { poNumber: "PO12345", poDate: "2024-12-01", amount: "500.00", status: "Open" },
            { poNumber: "PO67890", poDate: "2024-12-02", amount: "750.00", status: "Approved" }
        ];
    
        return mockPOs.filter(po => po.poNumber === purchaseOrder || po.amount === req.data.amount);
    });

})



