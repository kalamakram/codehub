sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.rt.invoiceprocessor.controller.process_invoice", {
        onInit: function () {
            console.log("Kalam -- controller.process_invoice.js is loaded");
            // Initialize view model
            var oViewModel = new JSONModel({
                selectedFile: null,
                selectedFileName: "",
                fileContent: null,
                isDocumentSelected: false,
                busy: false,
                documents: [],
                apiResponse: null
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Load initial invoice documents from the backend
            this.loadInvoiceDocuments();
        },

        loadInvoiceDocuments: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oBinding = oModel.bindList("/InvoiceDocuments");

            oBinding.requestContexts().then(function (aContexts) {
                const aDocuments = aContexts.map(context => context.getObject());
                this.getView().getModel("viewModel").setProperty("/documents", aDocuments);
            }.bind(this)).catch(function (oError) {
                sap.m.MessageBox.error("Error loading documents: " + oError.message);
            });
        },

        handleFileChange: function (oEvent) {
            var oFile = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
            if (oFile) {
                var oViewModel = this.getView().getModel("viewModel");
                var reader = new FileReader();

                reader.onload = function (e) {
                    var base64Content = e.target.result.split(',')[1];
                    oViewModel.setProperty("/selectedFile", oFile);
                    oViewModel.setProperty("/selectedFileName", oFile.name);
                    oViewModel.setProperty("/contentType", oFile.type);
                };
                reader.readAsDataURL(oFile);
            }
        },

        onUploadPress: function () {
            var that = this;
            var oModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            var oFile = oViewModel.getProperty("/selectedFile");

            if (!oFile) {
                MessageToast.show("Please select a file first");
                return;
            }
            oViewModel.setProperty("/busy", true);
            var reader = new FileReader();
            reader.onload = function (e) {
                var base64Content = e.target.result.split(',')[1];
                var oDataModel = that.getOwnerComponent().getModel();

                // Create new entry in the OData service
                var oListBinding = oDataModel.bindList("/InvoiceDocuments");
                var oContext = oListBinding.create({
                    fileContent: JSON.stringify(base64Content),
                    fileName: oFile.name,
                    contentType: oFile.type,
                    status: "Created"
                });

                oModel.submitBatch(oModel.getGroupId()).then(function () {
                    MessageToast.show("Document uploaded successfully");
                    oViewModel.setProperty("/busy", false);
                    oViewModel.setProperty("/selectedFile", null);
                    oViewModel.setProperty("/selectedFileName", "");
                    // Reload the documents and refresh the table
                    that.loadInvoiceDocuments();
                    that.getView().byId("documentsTable").getBinding("items").refresh();
                }).catch(function (error) {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error("Upload failed: " + error.message);
                });
            };
            reader.readAsDataURL(oFile);
        },

        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            var oViewModel = this.getView().getModel("viewModel");
            var oModel = this.getOwnerComponent().getModel();

            if (!oSelectedItem) {
                this.resetView();
                return;
            }

            var oContext = oSelectedItem.getBindingContext();
            oContext.requestObject().then(function (oData) {
                oViewModel.setProperty("/isDocumentSelected", true);

                // Fetch the PDF Viewer using this.byId
                var oPdfViewer = this.byId("pdfViewer");
                var pdfSource = oModel.sServiceUrl + "InvoiceDocuments(" + oData.ID + ")/fileContent";

                var oHtml = this.getView().byId("idFrame");
                oHtml.setContent("<iframe name='" + oData.fileName + "' src='" + pdfSource + "' height='700' width='920'></iframe>");

                // Bind the data to the form
                var oForm = this.byId("invoiceForm");
                if (oForm) {
                    oForm.setBindingContext(oContext);
                }
            }.bind(this)).catch(function (oError) {
                MessageBox.error("Error loading document: " + oError.message);
            });
        },

        resetView: function () {
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/isDocumentSelected", false);
            oViewModel.setProperty("/fileContent", null);


            var oForm = this.byId("invoiceForm");
            if (oForm) {
                oForm.unbindElement();
            }
        },
        // Call the Open AI API
        onProcessWithAI: async function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oSelectedFile = this.byId("documentsTable").getSelectedItem(); // Fetch selected file from the table
            var oModel = this.getOwnerComponent().getModel();

            if (!oSelectedFile) {
                MessageToast.show("Please select a document to process.");
                return;
            }
            oViewModel.setProperty("/busy", true); // Show busy indicator
            const oContext = oSelectedFile.getBindingContext(); // Get the context of the selected item

                // Fetch the full document details from the backend
                const oData = await oContext.requestObject();
                var fileContent;
                //const fileContent = 'JVBERi0xLjMKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jlc291cmNlcyAyIDAgUgovQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggMzk4Pj4Kc3RyZWFtCnicfZM9T8NADIb3/goPHWCoufN9d+OjSO1QQETsAYIIkASlVxD/nkvTQJLCrZbfJ/bjC8FqwlAZ+JycJXByyYETMgbJEyyStkTA9aBExqIjME42weQRjpbru6vl+eIYkpef2AFJcOQOjHDI9qnyo8ofMlhvi/usngNj1CPs2zlDI3btF6nP5kCM5IzTjImDXm0Jhd31nm83viqyGtZpEUKrtMzgtsj982BEGoxIFoUCLQVKDUQajYFZW6xDGkIkbByG0aRQu3YFnxVwkW0e6vzd51XZ4Ukp5NTBOBco3BhG1qC0fdrNNi197r86itAWFY9TZBCkqE+5roPUDiEtR+viCEUSSfURSeXTt8g196p4WJL/o6o9iXIGhWzPl21ex3pawN9TCWYbPT0CH3uJxSUTjZdefEqMhRXGZmIQFV6+YxFI267szkBUhHY7fc3bfE7zemRiT4ib+EXIkYloXDKNVvXjU6MORUQZnYgeQwxE/PE/NZ/WEmXYLpQF+31ZcFpU29LPYaoGkG8D0AMdCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFIgXQovQ291bnQgMQovTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XQo+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlIC9Gb250Ci9CYXNlRm9udCAvSGVsdmV0aWNhCi9TdWJ0eXBlIC9UeXBlMQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKNiAwIG9iago8PC9UeXBlIC9Gb250Ci9CYXNlRm9udCAvSGVsdmV0aWNhLUJvbGQKL1N1YnR5cGUgL1R5cGUxCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9Qcm9jU2V0IFsvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJXQovRm9udCA8PAovRjEgNSAwIFIKL0YyIDYgMCBSCj4+Ci9YT2JqZWN0IDw8Cj4+Cj4+CmVuZG9iago3IDAgb2JqCjw8Ci9Qcm9kdWNlciAoUHlGUERGIDEuNy4yIGh0dHA6Ly9weWZwZGYuZ29vZ2xlY29kZS5jb20vKQovQ3JlYXRpb25EYXRlIChEOjIwMjQxMjA0MDQ0MDI2KQo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFIKL09wZW5BY3Rpb24gWzMgMCBSIC9GaXRIIG51bGxdCi9QYWdlTGF5b3V0IC9PbmVDb2x1bW4KPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDU1NSAwMDAwMCBuIAowMDAwMDAwODM5IDAwMDAwIG4gCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA4NyAwMDAwMCBuIAowMDAwMDAwNjQyIDAwMDAwIG4gCjAwMDAwMDA3MzggMDAwMDAgbiAKMDAwMDAwMDk1MyAwMDAwMCBuIAowMDAwMDAxMDYyIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCA4IDAgUgovSW5mbyA3IDAgUgo+PgpzdGFydHhyZWYKMTE2NQolJUVPRgo=';

                var sActionPath = "/returnBase64(...)";
                var oBindContext = oModel.bindContext(sActionPath, null, {});
                oBindContext.setParameter("ID", oData.ID);
                oBindContext.execute().then(function () {
                    var oDataVal = oBindContext.getBoundContext().getObject();
                    fileContent = oDataVal.value; // It will have base64 value
                    if (!fileContent) {
                        throw new Error("Failed to fetch file content for the selected document.");
                    }
                    else {
                        this.callOpenAIAPI(fileContent);

                    }
                }.bind(this)).catch(function (error) 
                {
                MessageBox.error(`Error reading filecontent: ${error.message}`);
                console.error("Error:", error);
                });

            },

            callOpenAIAPI: async function (fileContent) {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();
                try{
                    oView.setBusy(true);
                    this.byId("uploadSection").setBusy(true); // Show busy indicator for the upload section
                    var sActionPath = "/callOpenAIAPI(...)";
                    var oBindContext = oModel.bindContext(sActionPath, null, {});
                    oBindContext.setParameter("fileContent", fileContent);
                   
                    oBindContext.execute().then(function () {
                     var oResponse = oBindContext.getBoundContext().getObject();
                     this.populateFormWithAIResponse(JSON.parse(oResponse.value));
                     oView.setBusy(false); // Stop busy indicator after processing
                     this.byId("uploadSection").setBusy(false); // Turn off busy indicator for the upload section
                    }.bind(this)).catch(function (error) 
                    {
                    MessageBox.error(`Error calling Nvidia Destination: ${error.message}`);
                    console.error("Error:", error);
                    oView.setBusy(false); // Stop busy indicator even in case of an error
                    this.byId("uploadSection").setBusy(false); // Turn off busy indicator for the upload section
                    });
                }
                catch (error) {
                    MessageBox.error(`Error processing invoice: ${error.message}`);
                    console.error("Error:", error);
                    oView.setBusy(false); // Stop busy indicator in the catch block
                    this.byId("uploadSection").setBusy(false); // Turn off busy indicator for the upload section
                }  
        },

        populateFormWithAIResponse: function (data) {
            const oForm = this.byId("invoiceForm");
            const context = oForm.getBindingContext();
        
            try {
                // Map values from AI response to the form fields
                context.setProperty("invoiceNumber", data.form["invoice_number"]?.answer || "");
                context.setProperty("invoiceDate", data.form["invoice_date"]?.answer || "");
                context.setProperty("dueDate", data.form["due_date"]?.answer || "");
                context.setProperty("supplierInfo", data.form["supplier_info"]?.answer || "");
                context.setProperty("supplierAddress", data.form["supplier_address"]?.answer || "");
                context.setProperty("buyerInfo", data.form["buyer_info"]?.answer || "");
                context.setProperty("buyerAddress", data.form["buyer_address"]?.answer || "");
                context.setProperty("contactInfo", data.form["contact_info"]?.answer || "");
                context.setProperty("currency", data.form["currency"]?.answer || "");
                context.setProperty("subtotal", data.form["subtotal"]?.answer || "");
                context.setProperty("tax", data.form["tax"]?.answer || "");
                context.setProperty("totalAmount", data.form["total_amount"]?.answer || "");
        
                // Log unparsed or missing fields for debugging
                console.log("AI Response processed and mapped to the form successfully.");
            } catch (err) {
                MessageBox.error("Failed to parse and bind AI response to the form.");
                console.error("Parsing Error:", err);
            }
        },
        saveExtractedData: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("viewModel");
            const oForm = this.byId("invoiceForm");
            const context = oForm.getBindingContext();
        
            if (!context) {
                sap.m.MessageBox.error("No data available to save.");
                return;
            }
        
            const invoiceData = context.getObject();
        
            // Save data to HANA Cloud
            oModel.create("/InvoiceDocuments", invoiceData, {
                success: function () {
                    MessageBox.success("Invoice data saved successfully.");
                },
                error: function (oError) {
                    MessageBox.error("Error saving invoice data: " + oError.message);
                }
            });
        },
        deleteExtractedData: function () {
            const oModel = this.getOwnerComponent().getModel();
            const oForm = this.byId("invoiceForm");
            const context = oForm.getBindingContext();
        
            if (!context) {
                sap.m.MessageBox.error("No data available to delete.");
                return;
            }
        
            const invoiceData = context.getObject();
        
            // Delete data from HANA Cloud
            oModel.remove("/InvoiceDocuments('" + invoiceData.ID + "')", {
                success: function () {
                    sap.m.MessageToast.show("Invoice data deleted successfully.");
                    oForm.unbindElement(); // Clear the form
                },
                error: function (oError) {
                    sap.m.MessageBox.error("Error deleting invoice data: " + oError.message);
                }
            });
        }
    });
});
