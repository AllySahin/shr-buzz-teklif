declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: Element | null): Html2PdfInstance;
    toPdf(): Html2PdfInstance;
    get(type: string): Html2PdfInstance;
    then(callback: (value: unknown) => void): Html2PdfInstance;
    finally(callback: () => void): Html2PdfInstance;
    save(): Html2PdfInstance;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
