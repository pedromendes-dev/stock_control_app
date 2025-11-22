import type { Product, Category } from "@/types";
import jsPDF from "jspdf";

export function exportProductsPDF(products: Product[], categories: Category[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Relatório de Produtos", 14, 14);
  doc.setFontSize(10);
  const headerY = 22;
  doc.text("ID", 14, headerY);
  doc.text("Nome", 50, headerY);
  doc.text("SKU", 120, headerY);
  doc.text("Categoria", 160, headerY);
  doc.text("Preço", 200, headerY);
  doc.text("Estoque", 230, headerY);

  let y = headerY + 6;
  const lineHeight = 6;
  products.forEach((p) => {
    if (y > 190) {
      // nova página simples
      doc.addPage();
      y = 20;
    }
    const cat = categories.find((c) => c.id === p.categoryId)?.name || "";
    doc.text(p.id.slice(0, 6), 14, y);
    doc.text(p.name.substring(0, 30), 50, y);
    doc.text(p.sku.substring(0, 15), 120, y);
    doc.text(cat.substring(0, 18), 160, y);
    doc.text(p.price.toFixed(2), 200, y, { align: "right" });
    doc.text(String(p.currentStock), 230, y, { align: "right" });
    y += lineHeight;
  });

  doc.save(`produtos_${Date.now()}.pdf`);
}
