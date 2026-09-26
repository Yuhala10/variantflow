'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { ArrowRight, Lock, MessageCircle, Send, Sparkles, Wand2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';

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

export const CatalogToolsPanel: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => {
  const store = useProductStore();
  const [csvText, setCsvText] = useState('');
  const [mappingPreview, setMappingPreview] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const { entitlements } = store.access;
  const canUseAdvancedImport = entitlements.canImportCsv;
  const canNormalizeSuppliers = entitlements.canNormalizeSuppliers;

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

  const sendFeedbackToWhatsApp = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedMessage = feedbackMessage.trim();
    if (!trimmedMessage) return;

    const cleanName = feedbackName.trim() ? `Name: ${feedbackName.trim()}\n` : '';
    const whatsappText = encodeURIComponent(`${cleanName}Message: ${trimmedMessage}`);
    window.open(`https://wa.me/681731512?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-ink">Import a supplier CSV</h3>
          {!canUseAdvancedImport && <span className="chip bg-gold-soft text-gold"><Lock className="h-3 w-3" /> Pro</span>}
        </div>

        {!canUseAdvancedImport ? (
          <div className="rounded-xl border border-line bg-canvas/60 p-5">
            <p className="text-sm leading-relaxed text-ink-2">
              Paste a supplier spreadsheet and VariantFlow maps the columns and cleans messy values automatically.
            </p>
            <button type="button" onClick={onUpgrade} className="btn btn-soft btn-sm mt-4">
              <Sparkles /> Unlock with Pro
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              aria-label="Supplier CSV data"
              spellCheck={false}
              placeholder={'Title,SKU,Price,Color,Size\nPremium Tee,TSH-001,20,Black,S'}
              className="field scroll-thin resize-y font-mono text-[13px] leading-relaxed"
            />

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleImportCsv} disabled={!csvText.trim()} className="btn btn-primary btn-sm">
                <Sparkles /> Auto-map columns
              </button>
              {canNormalizeSuppliers && (
                <button type="button" onClick={handleNormalizeSuppliers} disabled={!previewRows.length} className="btn btn-secondary btn-sm">
                  <Wand2 /> Clean values
                </button>
              )}
            </div>

            {Object.keys(mappingPreview).length > 0 && (
              <div className="animate-rise rounded-xl border border-line bg-canvas/60 p-3">
                <p className="mb-2 px-1 text-xs font-semibold text-ink-3">Detected columns</p>
                <ul className="space-y-1.5">
                  {Object.entries(mappingPreview).map(([header, match]) => (
                    <li key={header} className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
                      <span className="truncate font-medium text-ink">{header}</span>
                      <span className="inline-flex items-center gap-1.5 text-ink-3">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span className={`chip ${match === 'custom' ? 'bg-surface-2 text-ink-3' : 'bg-brand-soft text-brand-ink'}`}>{match}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="animate-rise rounded-xl border border-line bg-canvas/60 p-3">
                <p className="mb-2 px-1 text-xs font-semibold text-ink-3">Preview</p>
                <ul className="space-y-1.5 text-sm text-ink-2">
                  {previewRows.map((row, index) => (
                    <li key={index} className="truncate rounded-lg bg-surface px-3 py-2">{Object.values(row).slice(0, 4).join(' · ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={sendFeedbackToWhatsApp} className="border-t border-line pt-7">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <MessageCircle className="h-4 w-4 text-ink-3" /> Feedback & support
        </h3>
        <p className="mb-3 mt-1 text-xs text-ink-3">Found a bug or have an idea? Message us directly on WhatsApp.</p>
        <div className="space-y-2.5">
          <input
            value={feedbackName}
            onChange={(e) => setFeedbackName(e.target.value)}
            placeholder="Your name (optional)"
            aria-label="Your name"
            autoComplete="name"
            className="field"
          />
          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows={3}
            aria-label="Message"
            placeholder="What can we improve?"
            className="field resize-y"
          />
          <button type="submit" disabled={!feedbackMessage.trim()} className="btn btn-secondary w-full">
            <Send /> Send on WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
};
