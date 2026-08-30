import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Member, Transaction, Session, Team, Equipment, MoralReport } from "../types";
import { formatCurrency } from "../utils";

// Helper to get association settings from localStorage or fallback
export function getAssociationInfo() {
  let name = "Association Sportive & Culturelle";
  let address = "12 Avenue du Sport, 75000 Paris";
  let email = "contact@association-sportive.fr";
  let phone = "01 40 50 60 70";
  let siren = "W751000000 / RNA: W751000123";

  try {
    const raw = localStorage.getItem("assoc_settings_general");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name) name = parsed.name;
      if (parsed.address) address = parsed.address;
      if (parsed.email) email = parsed.email;
      if (parsed.phone) phone = parsed.phone;
      if (parsed.siren) siren = parsed.siren || parsed.rna || siren;
    }
  } catch {}

  return { name, address, email, phone, siren };
}

// Draw standard document header
function drawPDFHeader(doc: jsPDF, title: string, subtitle?: string) {
  const info = getAssociationInfo();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header colored bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 12, "F");

  // Association Name & Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(info.name, 14, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`${info.address} • Tél: ${info.phone} • E-mail: ${info.email}`, 14, 30);
  doc.text(`N° SIREN / RNA : ${info.siren}`, 14, 35);

  // Document Date (Right aligned)
  const todayStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  doc.text(`Document officiel édité le ${todayStr}`, pageWidth - 14, 24, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 39, pageWidth - 14, 39);

  // Document Main Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(title, 14, 48);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 54);
  }

  return subtitle ? 58 : 52;
}

// Draw standard document footer with page numbers
function drawPDFFooter(doc: jsPDF) {
  const info = getAssociationInfo();
  const totalPages = doc.internal.pages.length - 1; // 1-indexed count in jsPDF
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`${info.name} — Document confidentiel à usage interne`, 14, pageHeight - 9);
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - 14, pageHeight - 9, { align: "right" });
  }
}

// Draw Signature block
function drawSignatureBlock(doc: jsPDF, startY: number, titleLeft = "Pour le Trésorier", titleRight = "Pour le Président") {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // If startY is too close to bottom, add new page
  let currentY = startY;
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 25;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate 600

  // Left Signature
  doc.text(titleLeft, 14, currentY + 10);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Date et signature :", 14, currentY + 16);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY + 18, 70, 22);

  // Right Signature
  const rightX = pageWidth - 84;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(titleRight, rightX, currentY + 10);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Date et signature :", rightX, currentY + 16);
  doc.rect(rightX, currentY + 18, 70, 22);

  return currentY + 45;
}

// ==========================================
// 1. EXPORT MEMBERS LIST PDF
// ==========================================
export interface ExportMembersOptions {
  title?: string;
  categoryFilter?: string;
  includeSignatures?: boolean;
}

export function exportMembersPDF(members: Member[], options: ExportMembersOptions = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const docTitle = options.title || "Registre Officiel des Membres & Licenciés";
  const subtitle = options.categoryFilter && options.categoryFilter !== "all"
    ? `Filtre Catégorie : ${options.categoryFilter} (${members.length} membres)`
    : `Total enregistrés : ${members.length} membre(s)`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);

  // Stats boxes
  const paidCount = members.filter((m) => m.paymentStatus === "paid").length;
  const validMedCount = members.filter((m) => m.medicalCertificateStatus === "valid").length;
  const menCount = members.filter((m) => m.gender === "M").length;
  const womenCount = members.filter((m) => m.gender === "F").length;

  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - 28 - 9) / 4;

  // Box 1
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, boxWidth, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL MEMBRES", 18, startY + 5);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`${members.length}`, 18, startY + 11);

  // Box 2
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(14 + boxWidth + 3, startY, boxWidth, 14, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text("COTISATIONS PAYÉES", 18 + boxWidth + 3, startY + 5);
  doc.setFontSize(12);
  doc.text(`${paidCount} / ${members.length}`, 18 + boxWidth + 3, startY + 11);

  // Box 3
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.roundedRect(14 + (boxWidth + 3) * 2, startY, boxWidth, 14, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text("CERTIFICATS VALIDES", 18 + (boxWidth + 3) * 2, startY + 5);
  doc.setFontSize(12);
  doc.text(`${validMedCount} / ${members.length}`, 18 + (boxWidth + 3) * 2, startY + 11);

  // Box 4
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxWidth + 3) * 3, startY, boxWidth, 14, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("RÉPARTITION GENRE", 18 + (boxWidth + 3) * 3, startY + 5);
  doc.setFontSize(11);
  doc.text(`${menCount} H • ${womenCount} F`, 18 + (boxWidth + 3) * 3, startY + 11);

  startY += 18;

  // Table Data preparation
  const tableData = members.map((m, index) => {
    const isPaid = m.paymentStatus === "paid";
    const paymentStr = isPaid
      ? "Payé"
      : m.paymentStatus === "pending"
      ? "En attente"
      : "Non réglé";

    const isMedValid = m.medicalCertificateStatus === "valid";
    const medStr = isMedValid
      ? "Valide"
      : m.medicalCertificateStatus === "pending"
      ? "En attente"
      : m.medicalCertificateStatus === "exempt"
      ? "Dispensé"
      : "Expiré";

    return [
      (index + 1).toString(),
      m.name,
      m.licenseNumber || "N/C",
      m.category || `${m.age} ans`,
      m.role || "Membre",
      m.email || "-",
      m.phone || "-",
      paymentStr,
      medStr
    ];
  });

  autoTable(doc, {
    startY,
    head: [["#", "Nom & Prénom", "N° Licence", "Catégorie", "Rôle / Poste", "E-mail", "Téléphone", "Cotisation", "Certificat"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: "helvetica"
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left"
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { fontStyle: "bold", cellWidth: 42 },
      2: { cellWidth: 30, fontStyle: "bold" },
      3: { cellWidth: 28 },
      4: { cellWidth: 28 },
      5: { cellWidth: 45 },
      6: { cellWidth: 28 },
      7: { cellWidth: 25, halign: "center" },
      8: { cellWidth: 23, halign: "center" }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "Payé") {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
      if (data.section === "body" && data.column.index === 8) {
        if (data.cell.raw === "Valide") {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.raw === "Expiré") {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = "bold";
        }
      }
    }
  });

  // @ts-expect-error - lastAutoTable injected by autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : startY + 50;

  if (options.includeSignatures !== false) {
    drawSignatureBlock(doc, finalY, "Pour le Secrétaire Général", "Pour le Président");
  }

  drawPDFFooter(doc);
  doc.save(`membres_licencies_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ==========================================
// 2. EXPORT FINANCIAL REPORT PDF
// ==========================================
export interface ExportFinancialOptions {
  title?: string;
  currency?: string;
  periodLabel?: string;
  includeSignatures?: boolean;
}

export function exportFinancialReportPDF(transactions: Transaction[], options: ExportFinancialOptions = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const currencySymbol = options.currency === "USD" ? "$" : options.currency === "GBP" ? "£" : "€";
  const docTitle = options.title || "Rapport Comptable & Bilan Financier";
  const subtitle = options.periodLabel
    ? `Période : ${options.periodLabel} • Total écritures : ${transactions.length}`
    : `Bilan d'activité comptable (${transactions.length} écritures)`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);

  // Financial totals calculation
  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status !== "Annulé")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status !== "Annulé")
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - 28 - 6) / 3;

  // Box 1: Total Recettes
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, startY, boxWidth, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL RECETTES (+)", 18, startY + 5);
  doc.setFontSize(12);
  doc.text(`+${formatCurrency(totalIncome, options.currency || "EUR")}`, 18, startY + 12);

  // Box 2: Total Dépenses
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14 + boxWidth + 3, startY, boxWidth, 16, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(225, 29, 72);
  doc.text("TOTAL DÉPENSES (-)", 18 + boxWidth + 3, startY + 5);
  doc.setFontSize(12);
  doc.text(`-${formatCurrency(totalExpense, options.currency || "EUR")}`, 18 + boxWidth + 3, startY + 12);

  // Box 3: Solde Net
  const isPositiveNet = netBalance >= 0;
  doc.setFillColor(isPositiveNet ? 238 : 254, isPositiveNet ? 242 : 242, isPositiveNet ? 255 : 242);
  doc.roundedRect(14 + (boxWidth + 3) * 2, startY, boxWidth, 16, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(isPositiveNet ? 79 : 225, isPositiveNet ? 70 : 29, isPositiveNet ? 229 : 72);
  doc.text("SOLDE NET DE LA PÉRIODE", 18 + (boxWidth + 3) * 2, startY + 5);
  doc.setFontSize(12);
  doc.text(`${isPositiveNet ? "+" : ""}${formatCurrency(netBalance, options.currency || "EUR")}`, 18 + (boxWidth + 3) * 2, startY + 12);

  startY += 22;

  // Table Data
  const tableData = transactions.map((t, index) => {
    const isIncome = t.type === "income";
    const amountFormatted = `${isIncome ? "+" : "-"}${t.amount.toFixed(2)} ${currencySymbol}`;

    return [
      t.date || "-",
      t.title,
      t.category || "Autre",
      t.paymentMethod || "Virement",
      t.status || "Payé",
      amountFormatted
    ];
  });

  autoTable(doc, {
    startY,
    head: [["Date", "Libellé de l'Opération", "Catégorie", "Règlement", "Statut", "Montant TTC"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: "helvetica"
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { fontStyle: "bold", cellWidth: 65 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 25, halign: "right", fontStyle: "bold" }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith("+")) {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    }
  });

  // @ts-expect-error - lastAutoTable injected by autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : startY + 50;

  if (options.includeSignatures !== false) {
    drawSignatureBlock(doc, finalY, "Le Trésorier (Vu & Approuvé)", "Le Président de l'Association");
  }

  drawPDFFooter(doc);
  doc.save(`rapport_financier_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ==========================================
// 3. EXPORT PLANNING PDF
// ==========================================
export interface ExportPlanningOptions {
  title?: string;
  teamFilterName?: string;
  includeNotes?: boolean;
}

export function exportPlanningPDF(sessions: Session[], teams: Team[], options: ExportPlanningOptions = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const docTitle = options.title || "Planning Officiel des Entraînements & Compétitions";
  const subtitle = options.teamFilterName && options.teamFilterName !== "Toutes les équipes"
    ? `Équipe : ${options.teamFilterName} • Total séances : ${sessions.length}`
    : `Planning global du club (${sessions.length} créneaux planifiés)`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);

  // Teams map
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  // Table Data
  const tableData = sessions.map((s) => {
    const teamName = teamMap.get(s.teamId) || "Toutes équipes";
    const dateFormatted = `${s.date || ""} ${s.time || "00:00"}${s.durationMinutes ? ` (${s.durationMinutes} min)` : ""}`;
    const detailTitle = s.opponent ? `${s.title} vs ${s.opponent}` : s.title;

    return [
      dateFormatted,
      detailTitle,
      s.type || "Entraînement",
      teamName,
      s.location || "Gymnase Principal",
      s.notes || "-"
    ];
  });

  autoTable(doc, {
    startY,
    head: [["Date & Horaires", "Intitulé / Match", "Type", "Équipe", "Lieu / Salle", "Instructions & Notes"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: "helvetica"
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 60, fontStyle: "bold" },
      2: { cellWidth: 30 },
      3: { cellWidth: 38 },
      4: { cellWidth: 42 },
      5: { cellWidth: 55 }
    }
  });

  // @ts-expect-error - lastAutoTable injected by autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : startY + 50;

  drawSignatureBlock(doc, finalY, "Le Responsable Sportif", "Le Président");
  drawPDFFooter(doc);
  doc.save(`planning_officiel_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ==========================================
// 4. EXPORT BILAN MORAL PDF
// ==========================================
export function exportBilanMoralPDF(report: MoralReport, stats?: { membersCount?: number; teamsCount?: number; sessionsCount?: number }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const docTitle = `Bilan Moral & Rapport d'Activité — Saison ${report.season}`;
  const subtitle = `Présenté par l'exécutif de l'association • Statut : ${report.status === "approved" ? "Approuvé en AG" : "Projet"}`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Summary box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, pageWidth - 28, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rapporteur : ${report.authorName || "Le Président"}`, 18, startY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Membres : ${stats?.membersCount || 0} • Équipes : ${stats?.teamsCount || 0} • Séances organisées : ${stats?.sessionsCount || 0}`, 18, startY + 11);

  startY += 22;

  const addSection = (title: string, text: string) => {
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }
    doc.setFillColor(79, 70, 229);
    doc.rect(14, startY, 3, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 20, startY + 7);

    startY += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(text || "Aucun détail saisi.", pageWidth - 28);
    doc.text(splitText, 14, startY);
    startY += splitText.length * 5 + 8;
  };

  addSection("1. Mot de la Présidence & Orientations", report.presidentWord);
  addSection("2. Bilan Sportif & Réalisations de la Saison", report.sportingResults);
  addSection("3. Évolution des Effectifs & Vie de l'Association", report.membershipSummary);
  addSection("4. Projets, Investissements & Perspectives", report.perspectives);

  // Voting details box if approved
  if (report.voteFor !== undefined) {
    if (startY > 240) {
      doc.addPage();
      startY = 20;
    }
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(14, startY, pageWidth - 28, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text("RÉSULTAT DU VOTE D'APPROBATION EN ASSEMBLEÉ GÉNÉRALE", 18, startY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Pour : ${report.voteFor || 0}  |  Contre : ${report.voteAgainst || 0}  |  Abstentions : ${report.voteAbstain || 0}  |  Date d'approbation : ${report.approvalDate || report.date}`, 18, startY + 12);
    startY += 24;
  }

  drawSignatureBlock(doc, startY, "Le Secrétaire de Séance", "La Présidence");
  drawPDFFooter(doc);
  doc.save(`bilan_moral_${report.season.replace(/\s+/g, "")}.pdf`);
}

// ==========================================
// 5. EXPORT INVENTAIRE DU PATRIMOINE PDF
// ==========================================
export function exportInventairePDF(equipment: Equipment[], options?: { title?: string; season?: string }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const docTitle = options?.title || "Inventaire Officiel du Patrimoine & Équipements";
  const totalValuation = equipment.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 0), 0);
  const subtitle = `Valeur globale du parc : ${formatCurrency(totalValuation, "EUR")} • Total références : ${equipment.length}`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);

  const tableData = equipment.map((item, index) => {
    const totalVal = (item.unitPrice || 0) * item.quantity;
    return [
      (index + 1).toString(),
      item.name,
      item.category || "Matériel",
      item.quantity.toString(),
      item.condition || "Bon état",
      item.location || "Local du club",
      item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : "0.00 €",
      `${totalVal.toFixed(2)} €`
    ];
  });

  autoTable(doc, {
    startY,
    head: [["#", "Désignation de l'Équipement", "Catégorie", "Qté", "État Physique", "Emplacement", "Prix Unitaire", "Valeur Totale"]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { fontStyle: "bold", cellWidth: 70 },
      2: { cellWidth: 35 },
      3: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 30, halign: "center" },
      5: { cellWidth: 40 },
      6: { cellWidth: 30, halign: "right" },
      7: { cellWidth: 30, halign: "right", fontStyle: "bold" }
    }
  });

  // @ts-expect-error - autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : startY + 50;

  drawSignatureBlock(doc, finalY, "Le Responsable Matériel / Gestionnaire", "Le Trésorier");
  drawPDFFooter(doc);
  doc.save(`inventaire_patrimoine_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ==========================================
// 6. EXPORT BILAN ANNUEL COMPLET PDF (MORAL + FINANCIER + INVENTAIRE)
// ==========================================
export function exportBilanAnnuelCompletPDF(
  report: MoralReport,
  transactions: Transaction[],
  equipment: Equipment[],
  associationInfo: any,
  stats: { membersCount: number; teamsCount: number; sessionsCount: number }
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const docTitle = `Rapport d'Assemblée Générale & Bilan Annuel ${report.season}`;
  const subtitle = `Dossier Synthétique Complété : Bilan Moral, Bilan Financier et Inventaire du Patrimoine`;

  let startY = drawPDFHeader(doc, docTitle, subtitle);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Summary box
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, startY, pageWidth - 28, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text(`${associationInfo.name || "Association Sportive"} — Exercice ${report.season}`, 18, startY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Présidence : ${associationInfo.presidentName || "N/C"} | Trésorerie : ${associationInfo.treasurerName || "N/C"} | Secrétariat : ${associationInfo.secretaryName || "N/C"}`, 18, startY + 12);

  startY += 24;

  // SECTION 1: BILAN MORAL SUMMARY
  doc.setFillColor(79, 70, 229);
  doc.rect(14, startY, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("1. SYNTHÈSE DU BILAN MORAL DE LA PRÉSIDENCE", 18, startY + 5.5);
  startY += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("Mot de la Présidence :", 14, startY);
  startY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const pWord = doc.splitTextToSize(report.presidentWord || "Non renseigné.", pageWidth - 28);
  doc.text(pWord, 14, startY);
  startY += pWord.length * 4.5 + 6;

  // SECTION 2: FINANCIAL SUMMARY
  if (startY > 220) {
    doc.addPage();
    startY = 20;
  }

  doc.setFillColor(79, 70, 229);
  doc.rect(14, startY, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("2. SYNTHÈSE DU BILAN FINANCIER & COMPTE DE RÉSULTAT", 18, startY + 5.5);
  startY += 12;

  const totalInc = transactions.filter(t => t.type === "income" && t.status !== "Annulé").reduce((acc, t) => acc + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === "expense" && t.status !== "Annulé").reduce((acc, t) => acc + t.amount, 0);
  const net = totalInc - totalExp;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Recettes Totales : +${formatCurrency(totalInc, "EUR")}`, 14, startY);
  doc.text(`Dépenses Totales : -${formatCurrency(totalExp, "EUR")}`, 80, startY);
  doc.text(`Résultat Net : ${net >= 0 ? "+" : ""}${formatCurrency(net, "EUR")}`, 145, startY);

  startY += 8;

  // SECTION 3: INVENTAIRE SUMMARY
  if (startY > 220) {
    doc.addPage();
    startY = 20;
  }

  doc.setFillColor(79, 70, 229);
  doc.rect(14, startY, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("3. ÉVALUATION ET INVENTAIRE DU PATRIMOINE MATÉRIEL", 18, startY + 5.5);
  startY += 12;

  const totalAssetVal = equipment.reduce((acc, item) => acc + (item.unitPrice || 0) * item.quantity, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Nombre total d'équipements référencés : ${equipment.length}`, 14, startY);
  doc.text(`Valeur globale estimée du parc matériel : ${formatCurrency(totalAssetVal, "EUR")}`, 14, startY + 6);

  startY += 16;

  drawSignatureBlock(doc, startY, "Pour le Bureau Executif", "La Présidence");
  drawPDFFooter(doc);
  doc.save(`bilan_annuel_complet_${report.season.replace(/\s+/g, "")}.pdf`);
}
