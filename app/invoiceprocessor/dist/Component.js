sap.ui.define(["sap/ui/core/UIComponent","sap/ui/model/odata/v4/ODataModel","com/rt/invoiceprocessor/model/models"],function(e,o,t){"use strict";return e.extend("com.rt.invoiceprocessor.Component",{metadata:{manifest:"json",interfaces:["sap.ui.core.IAsyncContentCreation"]},init:function(){console.log("Kalam -- Component.js is loaded");e.prototype.init.apply(this,arguments);this.setModel(t.createDeviceModel(),"device");const i=new o({serviceUrl:"/invoice_process-srv/",synchronizationMode:"None"});this.setModel(i);this.getRouter().initialize()}})});
//# sourceMappingURL=Component.js.map