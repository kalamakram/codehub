//@ui5-bundle com/rt/invoiceprocessor/Component-preload.js
sap.ui.require.preload({
	"com/rt/invoiceprocessor/Component.js":function(){
sap.ui.define(["sap/ui/core/UIComponent","sap/ui/model/odata/v4/ODataModel","com/rt/invoiceprocessor/model/models"],function(e,o,t){"use strict";return e.extend("com.rt.invoiceprocessor.Component",{metadata:{manifest:"json",interfaces:["sap.ui.core.IAsyncContentCreation"]},init:function(){console.log("Kalam -- Component.js is loaded");e.prototype.init.apply(this,arguments);this.setModel(t.createDeviceModel(),"device");const i=new o({serviceUrl:"/invoice_process-srv/",synchronizationMode:"None"});this.setModel(i);this.getRouter().initialize()}})});
},
	"com/rt/invoiceprocessor/controller/App.controller.js":function(){
sap.ui.define(["sap/ui/core/mvc/Controller"],e=>{"use strict";return e.extend("com.rt.invoiceprocessor.controller.process_invoice",{onInit(){}})});
},
	"com/rt/invoiceprocessor/controller/process_invoice.controller.js":function(){
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/m/MessageBox","sap/m/MessageToast"],function(e,t,o,r){"use strict";return e.extend("com.rt.invoiceprocessor.controller.process_invoice",{onInit:function(){console.log("Kalam -- controller.process_invoice.js is loaded");var e=new t({selectedFile:null,selectedFileName:"",fileContent:null,isDocumentSelected:false,busy:false,documents:[],apiResponse:null});this.getView().setModel(e,"viewModel");this.loadInvoiceDocuments()},loadInvoiceDocuments:function(){const e=this.getOwnerComponent().getModel();const t=e.bindList("/InvoiceDocuments");t.requestContexts().then(function(e){const t=e.map(e=>e.getObject());this.getView().getModel("viewModel").setProperty("/documents",t)}.bind(this)).catch(function(e){sap.m.MessageBox.error("Error loading documents: "+e.message)})},handleFileChange:function(e){var t=e.getParameter("files")&&e.getParameter("files")[0];if(t){var o=this.getView().getModel("viewModel");var r=new FileReader;r.onload=function(e){var r=e.target.result.split(",")[1];o.setProperty("/selectedFile",t);o.setProperty("/selectedFileName",t.name);o.setProperty("/contentType",t.type)};r.readAsDataURL(t)}},onUploadPress:function(){var e=this;var t=this.getOwnerComponent().getModel();var n=this.getView().getModel("viewModel");var s=n.getProperty("/selectedFile");if(!s){r.show("Please select a file first");return}n.setProperty("/busy",true);var i=new FileReader;i.onload=function(i){var a=i.target.result.split(",")[1];var c=e.getOwnerComponent().getModel();var l=c.bindList("/InvoiceDocuments");var d=l.create({fileContent:JSON.stringify(a),fileName:s.name,contentType:s.type,status:"Created"});t.submitBatch(t.getGroupId()).then(function(){r.show("Document uploaded successfully");n.setProperty("/busy",false);n.setProperty("/selectedFile",null);n.setProperty("/selectedFileName","");e.loadInvoiceDocuments()}).catch(function(e){n.setProperty("/busy",false);o.error("Upload failed: "+oError.message)})};i.readAsDataURL(s)},onSelectionChange:function(e){var t=e.getParameter("listItem");var r=this.getView().getModel("viewModel");var n=this.getOwnerComponent().getModel();if(!t){this.resetView();return}var s=t.getBindingContext();s.requestObject().then(function(e){r.setProperty("/isDocumentSelected",true);var t=this.byId("pdfViewer");var o=n.sServiceUrl+"InvoiceDocuments("+e.ID+")/fileContent";var i=this.getView().byId("idFrame");i.setContent("<iframe name='"+e.fileName+"' src='"+o+"' height='700' width='920'></iframe>");var a=this.byId("invoiceForm");if(a){a.setBindingContext(s)}}.bind(this)).catch(function(e){o.error("Error loading document: "+e.message)})},resetView:function(){var e=this.getView().getModel("viewModel");e.setProperty("/isDocumentSelected",false);e.setProperty("/fileContent",null);var t=this.byId("invoiceForm");if(t){t.unbindElement()}},onProcessWithAI:async function(){const e=this.getView().getModel("viewModel");const t=this.byId("documentsTable").getSelectedItem();var n=this.getOwnerComponent().getModel();if(!t){r.show("Please select a document to process.");return}e.setProperty("/busy",true);const s=t.getBindingContext();const i=await s.requestObject();var a;var c="/returnBase64(...)";var l=n.bindContext(c,null,{});l.setParameter("ID",i.ID);l.execute().then(function(){var e=l.getBoundContext().getObject();a=e.value;if(!a){throw new Error("Failed to fetch file content for the selected document.")}else{this.callNvidiaAPI(a)}}.bind(this)).catch(function(e){o.error(`Error reading filecontent: ${e.message}`);console.error("Error:",e)})},callNvidiaAPI:async function(e){var t=this.getOwnerComponent().getModel();try{var r="/callNvidiaAPI(...)";var n=t.bindContext(r,null,{});n.setParameter("fileContent",e);n.execute().then(function(){}.bind(this)).catch(function(e){o.error(`Error calling Nvidia Destination: ${e.message}`);console.error("Error:",e)})}catch(e){o.error(`Error processing invoice: ${e.message}`);console.error("Error:",e)}finally{oViewModel.setProperty("/busy",false)}},populateFormWithAIResponse:function(e){const t=this.byId("invoiceForm");if(!t)return;const r=t.getBindingContext();const n=e?.choices?.[0]?.message?.content||"";try{const e=JSON.parse(n);r.setProperty("invoiceNumber",e.invoiceNumber||"");r.setProperty("grossAmount",e.totalCost||"");r.setProperty("dueDate",e.dueDate||"");r.setProperty("vendorName",e.vendorName||"")}catch(e){o.error("Failed to parse AI response.");console.error("Parsing Error:",e)}}})});
},
	"com/rt/invoiceprocessor/i18n/i18n_en_US.properties":'# This is the resource bundle for com.rt.invoiceprocessor\n\n#Texts for manifest.json\n\n#XTIT: Application name\nappTitle=Invoice Processing with AI models\n\n#YDES: Application description\nappDescription=An SAP Fiori application.\n#XTIT: Main view title\ntitle=Invoice Processing with AI models\n\n#XFLD,51\nflpTitle=Invoice Processor\n\n#XFLD,42\nflpSubtitle=with AI models\n',
	"com/rt/invoiceprocessor/manifest.json":'{"_version":"1.65.0","sap.app":{"id":"com.rt.invoiceprocessor","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.15.6","toolsId":"92295728-5c38-4673-89a6-19185d6c6f5c"},"dataSources":{"mainService":{"uri":"invoice_process-srv/","type":"OData","settings":{"odataVersion":"4.0"}}},"crossNavigation":{"inbounds":{"process_invoice-display":{"semanticObject":"process_invoice","action":"display","title":"{{flpTitle}}","subTitle":"{{flpSubtitle}}","signature":{"parameters":{},"additionalParameters":"allowed"}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.131.0","libs":{"sap.m":{},"sap.ui.core":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"com.rt.invoiceprocessor.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","controlAggregation":"pages","controlId":"app","transition":"slide","type":"View","viewType":"XML","path":"com.rt.invoiceprocessor.view"},"routes":[{"name":"Routeprocess_invoice","pattern":":?query:","target":["Targetprocess_invoice"]}],"targets":{"Targetprocess_invoice":{"id":"process_invoice","name":"process_invoice"}}},"rootView":{"viewName":"com.rt.invoiceprocessor.view.App","type":"XML","id":"App"}},"sap.cloud":{"public":true,"service":"InvoiceProcessing"}}',
	"com/rt/invoiceprocessor/model/models.js":function(){
sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"com/rt/invoiceprocessor/view/App.view.xml":'<mvc:View controllerName="com.rt.invoiceprocessor.controller.App"\n    displayBlock="true"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"><App id="app"></App></mvc:View>',
	"com/rt/invoiceprocessor/view/process_invoice.view.xml":'<mvc:View\n    controllerName="com.rt.invoiceprocessor.controller.process_invoice"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:u="sap.ui.unified"\n    xmlns:f="sap.ui.layout.form"\n    xmlns:html="http://www.w3.org/1999/xhtml"><SplitApp id="splitApp" mode="ShowHideMode"><masterPages><Page title="Documents" showHeader="true"><content><Table id="documentsTable"\n                        items="{/InvoiceDocuments}"\n                        mode="SingleSelect"\n                        selectionChange=".onSelectionChange"><columns><Column width="3rem"><CheckBox select=".onSelectAll"/></Column><Column><Text text="File Name"/></Column><Column><Text text="Status"/></Column></columns><items><ColumnListItem><cells><CheckBox selected="{selected}"/><Text text="{fileName}"/><Text text="{status}"/></cells></ColumnListItem></items></Table></content></Page></masterPages><detailPages><Page id="detailPage" showHeader="false"><content><HBox><VBox width="60%" class="sapUiSmallMargin"><VBox id="uploadSection" visible="true" busy="{viewModel>/busy}"><Title text="Upload Invoice for Processing" class="sapUiSmallMarginBottom"/><u:FileUploader\n                                    id="fileUploader"\n                                    name="myFileUpload"\n                                    tooltip="Upload your invoice file"\n                                    change="handleFileChange"\n                                    fileType="pdf"\n                                    buttonText="Choose Invoice PDF"\n                                    style="Emphasized"\n                                    class="sapUiSmallMarginBottom"/><Button \n                                    text="Upload"\n                                    press=".onUploadPress"\n                                    type="Emphasized"\n                                    enabled="{= !!${viewModel>/selectedFile}}"\n                                    class="sapUiSmallMarginBottom"/><Text\n                                    text="{viewModel>/selectedFileName}"\n                                    visible="{= !!${viewModel>/selectedFileName}}"/></VBox><VBox><Button\n                                text="Process with AI"\n                                type="Emphasized"\n                                press=".onProcessWithAI"\n                                busyIndicatorDelay="0"\n                                class="sapUiSmallMarginTop"\n                            /><core:HTML id="idFrame"/></VBox></VBox><VBox width="40%" class="sapUiSmallMargin"><f:SimpleForm\n                                id="invoiceForm"\n                                editable="true"\n                                layout="ResponsiveGridLayout"><f:content><Label text="Invoice Number"/><Input value="{invoiceNumber}"/><Label text="Due Date"/><DatePicker value="{dueDate}"/><Label text="Gross Amount"/><Input value="{grossAmount}"/><Label text="Net Amount"/><Input value="{netAmount}"/><Label text="Payment Terms"/><Input value="{paymentTerms}"/><Label text="Purchase Order"/><Input value="{purchaseOrder}"/><Label text="Buyer Name"/><Input value="{buyerName}"/><Label text="Buyer Address"/><Input value="{buyerAddress}"/><Label text="Receiver City"/><Input value="{receiverCity}"/><Label text="Receiver District"/><Input value="{receiverDistrict}"/><Label text="House Number"/><Input value="{receiverHouseNumber}"/><Label text="Postal Code"/><Input value="{receiverPostalCode}"/><Label text="State"/><Input value="{receiverState}"/><Label text="Street"/><Input value="{receiverStreet}"/></f:content></f:SimpleForm></VBox></HBox></content></Page></detailPages></SplitApp></mvc:View>'
});
//# sourceMappingURL=Component-preload.js.map
