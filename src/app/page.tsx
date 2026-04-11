"use client";

import { useState, useEffect } from "react";
import { generatePdf, type Product } from "./generate-pdf";

const STORAGE_KEY = "shr-buzz-form-data";

interface SavedFormData {
  firmaAdi: string;
  teklifNo: string;
  products: Product[];
  archivedProducts: Product[];
  bilgilendirmeSatirlari: string[];
}

function loadSavedFormData(): SavedFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedFormData;
  } catch {
    return null;
  }
}

function saveFormData(data: SavedFormData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function parsePrice(val: string): number {
  return parseFloat(val.replace(",", ".")) || 0;
}

function calcProfitPercent(satis: string, alis: string): string {
  const s = parsePrice(satis);
  const a = parsePrice(alis);
  if (a <= 0 || s <= 0) return "-";
  const pct = ((s - a) / a) * 100;
  return `%${pct.toFixed(1)}`;
}

const defaultProducts: Product[] = [
  { siraNo: 1, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Nar Suyu", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 2, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Limon Suyu", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 3, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Limon Suyu", ebat: "4950 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 4, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Portakal Suyu", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 5, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Portakal Suyu", ebat: "4950 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 6, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Limonata Özü", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 7, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Greyfurt Suyu", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 8, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Ananas Suyu", ebat: "4950 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 9, kategori: "%100 Doğal Sıkım Meyve Suyu", urunAdi: "Ananas Suyu", ebat: "980 ml", fiyat: "0", alisFiyati: "0" },
  { siraNo: 10, kategori: "SHR Buz", urunAdi: "Kristal Buz", ebat: "1 KG", fiyat: "0", alisFiyati: "0" },
  { siraNo: 11, kategori: "SHR Buz", urunAdi: "Kristal Buz", ebat: "5 KG", fiyat: "0", alisFiyati: "0" },
  { siraNo: 12, kategori: "Premium Buz", urunAdi: "Clear Ice (Kare)", ebat: "24 Adet", fiyat: "0", alisFiyati: "0" },
  { siraNo: 13, kategori: "Premium Buz", urunAdi: "Clear Ice (Küre)", ebat: "24 Adet", fiyat: "0", alisFiyati: "0" },
  { siraNo: 14, kategori: "Premium Buz", urunAdi: "Clear Ice (Colins)", ebat: "22 Adet", fiyat: "0", alisFiyati: "0" },
];

const defaultBilgilendirmeSatirlari: string[] = [
  "Yukarıdaki fiyatlarımız Türk Lirası (TL) cinsinden olup KDV (%1) dahil değildir.",
  "Fiyatlar adres teslim fiyatlarıdır.",
];

export default function Home() {
  const [firmaAdi, setFirmaAdi] = useState("CM Beach");
  const [teklifNo, setTeklifNo] = useState("SHR-26001");
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [bilgilendirmeSatirlari, setBilgilendirmeSatirlari] = useState<string[]>(defaultBilgilendirmeSatirlari);
  const [showArchive, setShowArchive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Sayfa açılışında kaydedilmiş verileri yükle
  useEffect(() => {
    const saved = loadSavedFormData();
    if (saved) {
      setFirmaAdi(saved.firmaAdi);
      setTeklifNo(saved.teklifNo);
      setProducts(saved.products);
      if (saved.archivedProducts) setArchivedProducts(saved.archivedProducts);
      if (saved.bilgilendirmeSatirlari) setBilgilendirmeSatirlari(saved.bilgilendirmeSatirlari);
    }
    setLoaded(true);
  }, []);

  // Her değişiklikte otomatik kaydet
  useEffect(() => {
    if (!loaded) return;
    saveFormData({ firmaAdi, teklifNo, products, archivedProducts, bilgilendirmeSatirlari });
  }, [firmaAdi, teklifNo, products, archivedProducts, bilgilendirmeSatirlari, loaded]);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        siraNo: prev.length + 1,
        kategori: "",
        urunAdi: "",
        ebat: "",
        fiyat: "200,00",
        alisFiyati: "0",
      },
    ]);
  };

  const removeProduct = (index: number) => {
    const removed = products[index];
    setArchivedProducts((prev) => [...prev, removed]);
    setProducts((prev) =>
      prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, siraNo: i + 1 }))
    );
  };

  const restoreProduct = (archiveIndex: number) => {
    const restored = archivedProducts[archiveIndex];
    setArchivedProducts((prev) => prev.filter((_, i) => i !== archiveIndex));
    setProducts((prev) => [
      ...prev,
      { ...restored, siraNo: prev.length + 1 },
    ]);
  };

  const deleteArchivedProduct = (archiveIndex: number) => {
    setArchivedProducts((prev) => prev.filter((_, i) => i !== archiveIndex));
  };

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleGeneratePdf = async () => {
    await generatePdf({ firmaAdi, teklifNo, products, bilgilendirmeSatirlari });
    // Teklif numarasını 1 artır
    const match = teklifNo.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2], 10) + 1;
      const padded = num.toString().padStart(match[2].length, "0");
      setTeklifNo(`${prefix}${padded}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl font-bold">
            S
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
              SHR BUZZ A.Ş.
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm">
              Fiyat Teklifi Oluşturucu
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Top Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Firma Adı
              </label>
              <input
                type="text"
                value={firmaAdi}
                onChange={(e) => setFirmaAdi(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Firma adı giriniz"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Teklif No
              </label>
              <input
                type="text"
                value={teklifNo}
                onChange={(e) => setTeklifNo(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Teklif numarası"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Ürün Listesi</h2>
            <span className="text-sm text-slate-500">
              {products.length} ürün
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-14">#</th>
                  <th className="px-3 py-3 text-left">Ürün Kategorisi</th>
                  <th className="px-3 py-3 text-left">Ürün Adı</th>
                  <th className="px-3 py-3 text-center w-28">Ebat</th>
                  <th className="px-3 py-3 text-right w-28">Alış (₺)</th>
                  <th className="px-3 py-3 text-right w-28">Satış (₺)</th>
                  <th className="px-3 py-3 text-center w-20">Kar %</th>
                  <th className="px-3 py-3 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-3 py-2 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.kategori}
                        onChange={(e) => updateProduct(index, "kategori", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.urunAdi}
                        onChange={(e) => updateProduct(index, "urunAdi", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.ebat}
                        onChange={(e) => updateProduct(index, "ebat", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-center text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.alisFiyati}
                        onChange={(e) => updateProduct(index, "alisFiyati", e.target.value)}
                        className="w-full px-2 py-1.5 border border-orange-200 rounded text-right text-slate-700 text-sm focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none bg-orange-50/50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={product.fiyat}
                        onChange={(e) => updateProduct(index, "fiyat", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-right text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-semibold ${
                        parsePrice(product.fiyat) > parsePrice(product.alisFiyati) && parsePrice(product.alisFiyati) > 0
                          ? "text-green-600"
                          : parsePrice(product.fiyat) < parsePrice(product.alisFiyati) && parsePrice(product.alisFiyati) > 0
                            ? "text-red-600"
                            : "text-slate-400"
                      }`}>
                        {calcProfitPercent(product.fiyat, product.alisFiyati)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {products.map((product, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => removeProduct(index)}
                    className="text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium">Kategori</label>
                  <input
                    type="text"
                    value={product.kategori}
                    onChange={(e) => updateProduct(index, "kategori", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Ürün Adı</label>
                    <input
                      type="text"
                      value={product.urunAdi}
                      onChange={(e) => updateProduct(index, "urunAdi", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Ebat</label>
                    <input
                      type="text"
                      value={product.ebat}
                      onChange={(e) => updateProduct(index, "ebat", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-orange-500 font-medium">Alış Fiyatı (₺)</label>
                    <input
                      type="text"
                      value={product.alisFiyati}
                      onChange={(e) => updateProduct(index, "alisFiyati", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-orange-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-orange-400 outline-none bg-orange-50/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Satış Fiyatı (₺)</label>
                    <input
                      type="text"
                      value={product.fiyat}
                      onChange={(e) => updateProduct(index, "fiyat", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Kar:</span>
                  <span className={`text-sm font-bold ${
                    parsePrice(product.fiyat) > parsePrice(product.alisFiyati) && parsePrice(product.alisFiyati) > 0
                      ? "text-green-600"
                      : parsePrice(product.fiyat) < parsePrice(product.alisFiyati) && parsePrice(product.alisFiyati) > 0
                        ? "text-red-600"
                        : "text-slate-400"
                  }`}>
                    {calcProfitPercent(product.fiyat, product.alisFiyati)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <button
              onClick={addProduct}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg text-slate-600 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Yeni Ürün Ekle
            </button>
          </div>
        </div>

        {/* Arşiv */}
        {archivedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowArchive((v) => !v)}
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-bold text-slate-800">Arşiv</h2>
                <span className="text-sm text-slate-500">({archivedProducts.length} ürün)</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-slate-400 transition-transform ${showArchive ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showArchive && (
              <>
                {/* Desktop Archive Table */}
                <div className="hidden md:block overflow-x-auto border-t border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="px-3 py-3 text-left">Ürün Kategorisi</th>
                        <th className="px-3 py-3 text-left">Ürün Adı</th>
                        <th className="px-3 py-3 text-center w-28">Ebat</th>
                        <th className="px-3 py-3 text-right w-28">Satış (₺)</th>
                        <th className="px-3 py-3 text-center w-32">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {archivedProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-amber-50/50 transition-colors">
                          <td className="px-3 py-2 text-slate-600 text-sm">{product.kategori}</td>
                          <td className="px-3 py-2 text-slate-600 text-sm">{product.urunAdi}</td>
                          <td className="px-3 py-2 text-center text-slate-600 text-sm">{product.ebat}</td>
                          <td className="px-3 py-2 text-right text-slate-600 text-sm">₺{product.fiyat}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => restoreProduct(index)}
                                className="text-green-500 hover:text-green-700 hover:bg-green-50 rounded p-1.5 transition-colors cursor-pointer"
                                title="Geri Yükle"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteArchivedProduct(index)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors cursor-pointer"
                                title="Kalıcı Sil"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Archive Cards */}
                <div className="md:hidden divide-y divide-slate-100 border-t border-slate-200">
                  {archivedProducts.map((product, index) => (
                    <div key={index} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">{product.urunAdi}</div>
                        <div className="text-xs text-slate-500">{product.kategori} &middot; {product.ebat} &middot; ₺{product.fiyat}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => restoreProduct(index)}
                          className="text-green-500 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Geri Yükle
                        </button>
                        <button
                          onClick={() => deleteArchivedProduct(index)}
                          className="text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bilgilendirme Satırları */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Bilgilendirme Notları</h2>
            <span className="text-sm text-slate-500">{bilgilendirmeSatirlari.length} satır</span>
          </div>
          <div className="px-4 sm:px-6 py-4 space-y-3">
            {bilgilendirmeSatirlari.map((satir, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-400 text-sm font-mono flex-shrink-0">*</span>
                <input
                  type="text"
                  value={satir}
                  onChange={(e) => {
                    setBilgilendirmeSatirlari((prev) =>
                      prev.map((s, i) => (i === index ? e.target.value : s))
                    );
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                />
                <button
                  onClick={() =>
                    setBilgilendirmeSatirlari((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors cursor-pointer flex-shrink-0"
                  title="Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setBilgilendirmeSatirlari((prev) => [...prev, ""])}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg text-slate-600 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Yeni Satır Ekle
            </button>
          </div>
        </div>

        {/* Generate PDF Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleGeneratePdf}
            className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-white font-bold text-base rounded-xl shadow-lg hover:bg-[#004080] hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            PDF Oluştur ve İndir
          </button>
        </div>
      </div>
    </main>
  );
}
