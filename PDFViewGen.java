package com.btc;

import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfWriter;


/**
 */

public class PDFViewGen {

	 private BaseFont bfBold;
	 private BaseFont bf;
	 private int pageNumber = 0;

	 public static void main(String[] args) {
	
	  String pdfFilename = "";
	  PDFViewGen generateInvoice = new PDFViewGen();
	  if (args.length < 1)
	  {
	   System.err.println("Usage: java "+ generateInvoice.getClass().getName()+
	   " PDF_Filename");
	   System.exit(1);
	  }

	  pdfFilename = args[0].trim();
	  generateInvoice.createPDF(pdfFilename);

	 }

	 private void createPDF (String pdfFilename){

	  Document doc = new Document();
	  PdfWriter docWriter = null;
	  initializeFonts();

	  try {
	   String path = "c:/parth/" + pdfFilename;
	   docWriter = PdfWriter.getInstance(doc , new FileOutputStream(path));
	   doc.addAuthor("betterThanZero");
	   doc.addCreationDate();
	   doc.addProducer();
	   doc.addCreator("MySampleCode.com");
	   doc.addTitle("Invoice");
	   doc.setPageSize(PageSize.LETTER);

	   doc.open();
	   PdfContentByte cb = docWriter.getDirectContent();
	   
	   boolean beginPage = true;
	   int y = 0;
	   
	   for(int i=0; i < 100; i++ ){
	    if(beginPage){
	     beginPage = false;
	     generateLayout(doc, cb); 
	     generateHeader(doc, cb);
	     y = 520; 
	    }
	    generateDetail(doc, cb, i, y);
	    y = y - 15;
	    if(y < 150){
	     printPageNumber(cb);
	     doc.newPage();
	     beginPage = true;
	    }
	   }
	   printPageNumber(cb);

	  }
	  catch (DocumentException dex)
	  {
	   dex.printStackTrace();
	  }
	  catch (Exception ex)
	  {
	   ex.printStackTrace();
	  }
	  finally
	  {
	   if (doc != null)
	   {
	    doc.close();
	   }
	   if (docWriter != null)
	   {
	    docWriter.close();
	   }
	  }
	 }

	 private void generateLayout(Document doc, PdfContentByte cb)  {

	  try {

	   cb.setLineWidth(1f);
	   
	   cb.rectangle(10,10,585,770);

	   //Header Rect Baseline
	   cb.moveTo(10,560);
	   cb.lineTo(595,560);
	   
	   //Header Rect Vertical divider
	   cb.moveTo(297.5,560);
	   cb.lineTo(297.5,780);
	   
	  //Header Rect Sub left hori divider1
	   cb.moveTo(10,720);
	   cb.lineTo(297.5,720);
	   
	  //Header Rect Sub left hori divider2
	   cb.moveTo(10,660);
	   cb.lineTo(297.5,660);
		   
	   
	   //Header Rect Sub left hori divider3
	   cb.moveTo(10,560);
	   cb.lineTo(297.5,560);
	   
	   //Header Rect Sub Right hori divider1
	   cb.moveTo(297.5,760);
	   cb.lineTo(595,760);
	   
	   //Header Rect Sub Right hori divider2
	   cb.moveTo(297.5,740);
	   cb.lineTo(595,740);
	   
	   //Header Rect Sub Right hori divider3
	   cb.moveTo(297.5,720);
	   cb.lineTo(595,720);
	   
	   
	   //Header Rect Sub Right hori divider4
	   cb.moveTo(297.5,700);
	   cb.lineTo(595,700);
	   
	   //Header Rect Sub Right hori divider5
	   cb.moveTo(297.5,680);
	   cb.lineTo(595,680);
	   
	   //Header Rect Sub Right hori divider5
	   cb.moveTo(446.2,680);
	   cb.lineTo(446.2,780);
	   
	   // Invoice Header box layout
	  /* cb.rectangle(420,700,150,60);
	   cb.moveTo(420,720);
	   cb.lineTo(570,720);
	   cb.moveTo(420,740);
	   cb.lineTo(570,740);
	   cb.moveTo(480,700);
	   cb.lineTo(480,760);*/
	   cb.stroke();

	   // Invoice Header box Text Headings 
	   /*createHeadings(cb,422,743,"Account No.");
	   createHeadings(cb,422,723,"Invoice No.");
	   createHeadings(cb,422,703,"Invoice Date");*/

	   // Invoice Detail box layout 
	   /*cb.rectangle(20,50,550,600);*/
	   
	   //Header Row
	   cb.moveTo(10,540);
	   cb.lineTo(595,540);
	   //Header Row
	   
	   // First Column
	   cb.moveTo(50,150);
	   cb.lineTo(50,560);
	   
	   // Second Column
	   cb.moveTo(350,150);
	   cb.lineTo(350,560);
	   
	   
	   cb.moveTo(430,150);
	   cb.lineTo(430,560);
	   
	   cb.moveTo(500,150);
	   cb.lineTo(500,560);
	   
	   
	   cb.moveTo(10,150);
	   cb.lineTo(595,150);
	   
	   cb.moveTo(297.5,10);
	   cb.lineTo(297.5,30);
	   
	   
	   cb.moveTo(297.5,30);
	   cb.lineTo(595,30);
	   
	   cb.stroke();

	   // Invoice Detail box Text Headings 
	   createHeadings(cb,22,550,"Sr No");
	   createHeadings(cb,52,550,"Particulars");
	   createHeadings(cb,372,550,"Qnt");
	   createHeadings(cb,432,550,"Price");
	   createHeadings(cb,502,550,"Ext Price");

	   //add the images
	   Image companyLogo = Image.getInstance("c:/parth/images/olympics_logo.png");
	   companyLogo.setAbsolutePosition(25,720);
	   companyLogo.scalePercent(25);
	   doc.add(companyLogo);

	  }

	  catch (DocumentException dex){
	   dex.printStackTrace();
	  }
	  catch (Exception ex){
	   ex.printStackTrace();
	  }

	 }
	 
	 private void generateHeader(Document doc, PdfContentByte cb)  {

	  try {

	   createHeadings(cb,200,770,"Company Name");
	   createHeadings(cb,200,760,"Address Line 1");
	   createHeadings(cb,200,750,"Address Line 2");
	   createHeadings(cb,200,740,"City, State - ZipCode");
	   createHeadings(cb,200,730,"Country");
	   
	   
	   createHeadings(cb,25,710,"Dispathced to");
	   createHeadings(cb,25,700,"Khodiyar");
	   createHeadings(cb,25,690,"Surat");
	   createHeadings(cb,25,680,"874945631");
	   
	   
	   createHeadings(cb,25,650,"Invoice to");
	   createHeadings(cb,25,640,"Khodiyar");
	   createHeadings(cb,25,630,"Surat");
	   createHeadings(cb,25,620,"874945631");
	   
	   createHeadings(cb,25,600,"Contact Person :");
	   createHeadings(cb,25,590,"Contact :");

	   
	   createHeadings(cb,302,772,"Voucher No");
	   createHeadings(cb,302,762,"SO/509/15-16");
	   
	   createHeadings(cb,302,733,"Buyer's Ref./Order No");
	   createHeadings(cb,302,723,"SO/509/15-16");
	   
	   createHeadings(cb,302,712,"Dispatch Through");
	   createHeadings(cb,302,702,"Private Tempo");
	   
	   createHeadings(cb,302,692,"Terms of Delivery");
	   createHeadings(cb,302,682,"URGENT");
	   
	   createHeadings(cb,449,772,"Dated to");
	   createHeadings(cb,449,762,"19-Mar-2016");
	   
	   
	   createHeadings(cb,449,752,"Mode/Term Of Payments");
	   createHeadings(cb,449,742,"Advanced");
	   
	   
	   createHeadings(cb,449,733,"Other Reference(s)");
	   createHeadings(cb,449,723,"URGENT");
	   
	   
	   createHeadings(cb,449,712,"Destination");
	   createHeadings(cb,449,702,"Surat");
	   
	   createHeadings(cb,15,142,"Amount chargeable in Words");
	   createHeadings(cb,15,130,"INR Two Thousand Three Hundred Only");
	   
	   createHeadings(cb,15,95,"Company's VAT TIN");
	   createHeadings(cb,15,85,"Company's CST No.");
	   createHeadings(cb,15,75,"Buyer's VAT TIN");
	   createHeadings(cb,15,65,"Buyer's CST No.");
	   createHeadings(cb,15,55,"Company's PAN");
	   
	   createHeadings(cb,297,65,"Company's Bank Detail");
	   createHeadings(cb,297,55,"Bank Name");
	   createHeadings(cb,297,45,"A/C No.");
	   createHeadings(cb,297,35,"Branch & IFSC Code");
  
  	   createHeadings(cb,445,25,"For");
	   createHeadings(cb,445,15,"Authorised Signatory");
  
	  }

	  catch (Exception ex){
	   ex.printStackTrace();
	  }

	 }
	 
	 private void generateDetail(Document doc, PdfContentByte cb, int index, int y)  {
	  DecimalFormat df = new DecimalFormat("0.00");
	  
	  try {

	   createContent(cb,40,y,String.valueOf(index+1),PdfContentByte.ALIGN_RIGHT);
	   createContent(cb,52,y, "ITEM" + String.valueOf(index+1),PdfContentByte.ALIGN_LEFT);
	   createContent(cb,360,y, String.valueOf(index+1),PdfContentByte.ALIGN_CENTER);
	   
	   double price = Double.valueOf(df.format(Math.random() * 10));
	   double extPrice = price * (index+1) ;
	   createContent(cb,498,y, df.format(price),PdfContentByte.ALIGN_RIGHT);
	   createContent(cb,568,y, df.format(extPrice),PdfContentByte.ALIGN_RIGHT);
	   
	  }

	  catch (Exception ex){
	   ex.printStackTrace();
	  }

	 }

	 private void createHeadings(PdfContentByte cb, float x, float y, String text){


	  cb.beginText();
	  cb.setFontAndSize(bfBold, 8);
	  cb.setTextMatrix(x,y);
	  cb.showText(text.trim());
	  cb.endText(); 

	 }
	 
	 private void printPageNumber(PdfContentByte cb){


	  cb.beginText();
	  cb.setFontAndSize(bfBold, 8);
	  cb.showTextAligned(PdfContentByte.ALIGN_RIGHT, "Page No. " + (pageNumber+1), 65 , 15, 0);
	  cb.endText(); 
	  
	  pageNumber++;
	  
	 }
	 
	 private void createContent(PdfContentByte cb, float x, float y, String text, int align){


	  cb.beginText();
	  cb.setFontAndSize(bf, 8);
	  cb.showTextAligned(align, text.trim(), x , y, 0);
	  cb.endText(); 

	 }

	 private void initializeFonts(){


	  try {
	   bfBold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
	   bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);

	  } catch (DocumentException e) {
	   e.printStackTrace();
	  } catch (IOException e) {
	   e.printStackTrace();
	  }


	 }

	}