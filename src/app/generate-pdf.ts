export interface Product {
  siraNo: number;
  kategori: string;
  urunAdi: string;
  ebat: string;
  fiyat: string;
  alisFiyati: string;
}

interface PdfOptions {
  firmaAdi: string;
  teklifNo: string;
  products: Product[];
  bilgilendirmeSatirlari: string[];
  contact?: string;
  taxId?: string;
  firmaYetkilisi?: string;
  logoPath?: string;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadImageAsBase64(paths: string[]): Promise<string> {
  for (const imagePath of paths) {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) continue;

      const imageBlob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Görüntü okunamadı: ${imagePath}`));
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.warn(`Logo yüklenemedi: ${imagePath}`, error);
    }
  }

  return "";
}

export async function generatePdf({ firmaAdi, teklifNo, products, bilgilendirmeSatirlari, contact = "+90 533 084 09 48", taxId = "32047036162", firmaYetkilisi = "Serkan Uyar", logoPath = "./logo.png" }: PdfOptions) {
  const html2pdf = (await import("html2pdf.js")).default;

  const leftLogoBase64 = await loadImageAsBase64([logoPath, "./logo.png"]);
  const rightLogoBase64 = await loadImageAsBase64(["./judologo.png", "./jupalogo.png", "./logo.png"]);
  const today = new Date();
  const teklifTarihi = today.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const gecerlilikDate = new Date(today);
  gecerlilikDate.setDate(gecerlilikDate.getDate() + 30);
  const gecerlilikTarihi = gecerlilikDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const tableRows = products
    .map(
      (p, i) => `
    <tr style="background:${i % 2 === 1 ? "#f0f7ff" : "#ffffff"};">
      <td style="padding:7px 6px;text-align:center;border-bottom:1px solid #e5e5e5;font-size:9px;">${i + 1}</td>
      <td style="padding:7px 6px;border-bottom:1px solid #e5e5e5;font-size:9px;">${escapeHtml(p.kategori)}</td>
      <td style="padding:7px 6px;border-bottom:1px solid #e5e5e5;font-size:9px;">${escapeHtml(p.urunAdi)}</td>
      <td style="padding:7px 6px;text-align:center;border-bottom:1px solid #e5e5e5;font-size:9px;">${escapeHtml(p.ebat)}</td>
      <td style="padding:7px 6px;text-align:right;border-bottom:1px solid #e5e5e5;font-size:9px;">₺${escapeHtml(p.fiyat)}</td>
    </tr>`
    )
    .join("");

  const leftLogoImageSrc = leftLogoBase64 || "./logo.png";
  const rightLogoImageSrc = rightLogoBase64 || "./judologo.png";

  const html = `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#222;width:700px;padding:40px 40px 30px 40px;box-sizing:border-box;">
  
  <!-- Header -->
  <div style="display:flex;align-items:center;margin-bottom:4px;gap:10px;">
    <!-- Left: Logo -->
    <div style="flex-shrink:0;width:95px;display:flex;justify-content:flex-start;align-items:center;">
      <img src="${leftLogoImageSrc}" style="width:90px;height:auto;max-height:70px;object-fit:contain;" />
    </div>

    <!-- Center: Address and quote info -->
    <div style="flex:1;min-width:0;text-align:center;padding:0 8px;">
      <div style="font-size:8.5px;color:#555;line-height:1.65;display:inline-block;text-align:left;">
        <div>Adres: Esenköy Mah. Bademli Mevkii No:221 Fethiye/Muğla</div>
        <div>İletişim: ${contact}</div>
        <div>Vergi Dairesi: Fethiye &nbsp;&nbsp; Vergi No: ${taxId}</div>
      </div>
      <div style="margin-top:6px;font-size:8.5px;color:#555;line-height:1.7;display:inline-block;text-align:left;">
        <table style="border-collapse:collapse;">
          <tr><td style="font-weight:bold;padding-right:8px;white-space:nowrap;">Teklif No:</td><td>${escapeHtml(teklifNo)}</td></tr>
          <tr><td style="font-weight:bold;padding-right:8px;white-space:nowrap;">Teklif Tarihi:</td><td>${teklifTarihi}</td></tr>
          <tr><td style="font-weight:bold;padding-right:8px;white-space:nowrap;">Geçerlilik Tarihi:</td><td>${gecerlilikTarihi}</td></tr>
        </table>
      </div>
    </div>

    <!-- Right: Logo -->
    <div style="flex-shrink:0;width:95px;display:flex;justify-content:flex-end;align-items:center;">
      <img src="${rightLogoImageSrc}" style="width:90px;height:auto;max-height:70px;object-fit:contain;" />
    </div>
  </div>

  <!-- Divider -->
  <hr style="border:none;border-top:2px solid #003366;margin:10px 0 16px 0;" />

  <!-- Greeting -->
  <div style="font-size:10px;color:#333;margin-bottom:4px;line-height:1.6;">
    Sayın, ${escapeHtml(firmaAdi)} şirket yetkilisi,<br/>
    Firmamızdan istemiş olduğunuz ürün/hizmete ilişkin teklif aşağıda bilginize sunulmuştur.
  </div>

  <!-- Table -->
  <table style="width:100%;border-collapse:collapse;margin-top:12px;margin-bottom:20px;">
    <thead>
      <tr style="background:#003366;">
        <th style="padding:8px 6px;color:#fff;font-size:9px;font-weight:bold;text-align:center;border-bottom:2px solid #002244;width:40px;">Sıra No</th>
        <th style="padding:8px 6px;color:#fff;font-size:9px;font-weight:bold;text-align:left;border-bottom:2px solid #002244;">Ürün Kategorisi</th>
        <th style="padding:8px 6px;color:#fff;font-size:9px;font-weight:bold;text-align:left;border-bottom:2px solid #002244;">Ürün Adı</th>
        <th style="padding:8px 6px;color:#fff;font-size:9px;font-weight:bold;text-align:center;border-bottom:2px solid #002244;width:65px;">Ebat</th>
        <th style="padding:8px 6px;color:#fff;font-size:9px;font-weight:bold;text-align:right;border-bottom:2px solid #002244;width:70px;">Fiyat</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <!-- Notes -->
  <div style="font-size:8px;color:#777;font-style:italic;line-height:1.8;margin-bottom:40px;">
    ${bilgilendirmeSatirlari.map(s => `*${escapeHtml(s)}`).join('<br/>')}
  </div>

  <!-- Signature -->
  <div style="text-align:right;margin-top:40px;">
    <div style="font-size:12px;font-weight:bold;color:#003366;">FİRMA YETKİLİSİ</div>
    <div style="font-size:10px;color:#444;margin-top:3px;">${escapeHtml(firmaYetkilisi)}</div>
  </div>
</div>`;

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const dateStr = today.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const fileName = `${firmaAdi} - ${dateStr} Fiyat Teklifi.pdf`;

  html2pdf()
    .set({
      margin: [6, 6, 6, 6],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container.firstElementChild)
    .toPdf()
    .get("pdf")
    .then((pdf: unknown) => {
      const pdfDoc = pdf as { output: (type: string) => Blob };
      const blob = pdfDoc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    })
    .finally(() => {
      document.body.removeChild(container);
    });
}
