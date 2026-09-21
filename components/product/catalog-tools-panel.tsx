'use client';

import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { useProductStore } from '../../store/productStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { UploadCloud, Sparkles, ArrowRight, MessageSquareText, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

const CANONICAL_HEADER_MAP: Record<string, string[]> = {
  title: ['title', 'product', 'product name', 'product_title', 'name'],
  sku: ['sku', 'variant sku', 'product sku', 'shopify sku', 'item sku'],
  price: ['price', 'unit price', 'cost', 'amount', 'price usd', 'retail price'],
  size: ['size', 'sizes', 'variant size'],
  color: ['color', 'colour', 'variant color', 'colour family'],
  material: ['material', 'fabric', 'composition'],
  category: ['category', 'collection', 'department'],
};

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
const normalizeCell = (value: unknown) => String(value ?? '').trim();

const inferColumnMapping = (headers: string[]) => {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    let bestMatch = 'custom';
    let bestScore = 0;

    Object.entries(CANONICAL_HEADER_MAP).forEach(([canonical, aliases]) => {
      aliases.forEach((alias) => {
        const score = normalized.includes(alias) ? alias.length : 0;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = canonical;
        }
      });
    });

    mapping[header] = bestMatch;
  });

  return mapping;
};

export const CatalogToolsPanel: React.FC = () => {
  const store = useProductStore();
  const [csvText, setCsvText] = useState('');
  const [mappingPreview, setMappingPreview] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const canUseAdvancedImport = store.subscriptionTier === 'PRO' || store.subscriptionTier === 'SCALE';
  const canNormalizeSuppliers = canUseAdvancedImport;

  const planLabel = useMemo(() => {
    if (store.subscriptionTier === 'SCALE') return 'Scale';
    if (store.subscriptionTier === 'PRO') return 'Pro';
    return 'Free';
  }, [store.subscriptionTier]);

  const handleImportCsv = () => {
    if (!csvText.trim()) return;

    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const headers: string[] = parsed.meta.fields ?? [];
    const rows = (parsed.data ?? []).slice(0, 3).map((row: Record<string, string>) => {
      const cleaned: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        cleaned[key] = normalizeCell(value).replace(/\s+/g, ' ');
      });
      return cleaned;
    });

    setMappingPreview(inferColumnMapping(headers));
    setPreviewRows(rows);

    const firstTitleValue = headers.find((header: string) => inferColumnMapping([header])[header] === 'title');
    if (firstTitleValue && rows[0]?.[firstTitleValue]) {
      store.setProductTitle(rows[0][firstTitleValue]);
    }
  };

  const handleNormalizeSuppliers = () => {
    if (!previewRows.length) return;

    const normalized = previewRows.map((row) => {
      const normalizedRow: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalizedRow[key] = value
          .replace(/[_-]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      });
      return normalizedRow;
    });

    setPreviewRows(normalized);
  };

  const sendFeedbackToWhatsApp = () => {
    const trimmedMessage = feedbackMessage.trim();
    if (!trimmedMessage) return;

    const cleanName = feedbackName.trim() ? `Name: ${feedbackName.trim()}\n` : '';
    const whatsappText = encodeURIComponent(`${cleanName}Message: ${trimmedMessage}`);
    window.open(`https://wa.me/681731512?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <UploadCloud className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Catalog Import & Mapping</h3>
        </div>

        {!canUseAdvancedImport ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 leading-relaxed">
            Upgrade to PRO or SCALE to unlock CSV import, automatic column mapping, and cleanup tools.
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={7}
              placeholder="Paste supplier CSV data here...\nTitle,SKU,Price,Color,Size\nPremium Tee,TSH-001,20,Black,S"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleImportCsv}
                className="h-9 bg-slate-950 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-map columns
              </Button>

              {canNormalizeSuppliers && (
                <Button
                  type="button"
                  onClick={handleNormalizeSuppliers}
                  variant="outline"
                  className="h-9 border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Normalize suppliers
                </Button>
              )}
            </div>

            {Object.keys(mappingPreview).length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Detected mapping</div>
                <div className="space-y-2 text-[11px] text-slate-700">
                  {Object.entries(mappingPreview).map(([header, match]) => (
                    <div key={header} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                      <span className="font-medium">{header}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {match}
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Preview</div>
                <div className="space-y-1.5 text-[11px] text-emerald-900">
                  {previewRows.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{Object.values(row).slice(0, 4).join(' • ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareText className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Complaints & Suggestions</h3>
        </div>

        <div className="space-y-3">
          <Input
            value={feedbackName}
            onChange={(e) => setFeedbackName(e.target.value)}
            placeholder="Your name (optional)"
            className="h-10 border-slate-200 text-xs"
          />

          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows={5}
            placeholder="Tell us about a bug, improvement idea, or anything you want fixed..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />

          <Button
            type="button"
            onClick={sendFeedbackToWhatsApp}
            className="h-10 w-full bg-[#25D366] text-white hover:bg-[#1fb75a] text-[10px] font-bold uppercase tracking-wider rounded-xl"
          >
            <Send className="w-3.5 h-3.5" /> Send to WhatsApp
          </Button>

        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#f7f1ea] p-4 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Current plan status</div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2">
          <span className="text-xs font-bold text-slate-700">{planLabel} plan</span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {store.subscriptionTier === 'SCALE' ? 'Smart mapping + normalization active' : canUseAdvancedImport ? 'CSV tools + cleanup active' : 'Upgrade available'}
          </span>
        </div>
      </div>
    </div>
  );
};
