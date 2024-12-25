sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v4/ODataModel",
    "com/rt/invoiceprocessor/model/models"
], function (UIComponent, ODataModel, models) {
    "use strict";

    return UIComponent.extend("com.rt.invoiceprocessor.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            console.log("Kalam -- Component.js is loaded");

            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Initialize OData V4 model
            const oODataModel = new ODataModel({
                serviceUrl: "/invoice_process-srv/",
                synchronizationMode: "None" // OData V4 requires this
            });
            this.setModel(oODataModel); // Set as the default model

            // Enable routing
            this.getRouter().initialize();
        }
    });
});
