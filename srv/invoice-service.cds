using app.invoices as invoice from '../db/schema';
service InvoiceService @(path: '/invoice_process-srv') {
  entity InvoiceDocuments as projection on invoice.InvoiceDocuments;
  action returnBase64(ID : UUID) returns LargeString;
  action callOpenAIAPI(fileContent: LargeString) returns String;
}