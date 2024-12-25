namespace app.invoices;
using { managed} from '@sap/cds/common';
entity InvoiceDocuments:managed
{
    key ID : UUID;
  //  @Core.ContentDisposition.Filename: fileName
    @Core.MediaType  : contentType
    fileContent   : LargeBinary;
    fileName : String(100);
    @Core.IsMediaType: true
    contentType : String;
    status : String(100);
    invoiceNumber : String(100);
    invoiceDate : Date;
    dueDate : Date;
    supplierInfo : String(200);
    supplierAddress : String(200);
    buyerInfo : String(200);
    buyerAddress : String(200);
    contactInfo: String(200);
    currency : String(20);
    subtotal : Decimal;
    tax : Decimal;
    totalAmount : Decimal;
    paymentTerms : String(100);
    purchaseOrder : String(100);
    receiverCity : String(100);
    receiverDistrict : String(100);
    receiverHouseNumber : String(100);
    receiverPostalCode : String(100);
    receiverState : String(100);
    receiverStreet : String(100);
}
