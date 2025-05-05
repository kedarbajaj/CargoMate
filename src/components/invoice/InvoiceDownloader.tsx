
import React from 'react';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InvoiceData } from '@/types/delivery';

interface InvoiceDownloaderProps {
  invoiceData: InvoiceData;
  invoiceRef: React.RefObject<HTMLDivElement>;
}

const InvoiceDownloader: React.FC<InvoiceDownloaderProps> = ({ invoiceData, invoiceRef }) => {
  const { t } = useTranslation();

  const downloadPDF = () => {
    if (!invoiceRef.current) return;
    
    const element = invoiceRef.current;
    const opt = {
      margin: [10, 10],
      filename: `invoice_${invoiceData.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Clone the element to modify it without affecting the displayed version
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Add a print-specific class for styling
    clonedElement.classList.add('print-version');
    
    // Hide any elements not needed in the PDF
    const buttonsToRemove = clonedElement.querySelectorAll('.no-print');
    buttonsToRemove.forEach(btn => {
      (btn as HTMLElement).style.display = 'none';
    });
    
    // Temporarily append to document, generate PDF, then remove
    document.body.appendChild(clonedElement);
    
    html2pdf().from(clonedElement).set(opt).save()
      .then(() => {
        document.body.removeChild(clonedElement);
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(clonedElement);
      });
  };

  return (
    <Button 
      variant="cargomate" 
      size="sm" 
      className="mb-4 no-print"
      onClick={downloadPDF}
    >
      <Download className="mr-2 h-4 w-4" />
      {t('invoice.downloadPdf')}
    </Button>
  );
};

export default InvoiceDownloader;
