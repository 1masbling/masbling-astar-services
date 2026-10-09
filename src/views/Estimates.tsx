
import { useState, useMemo } from 'react';
import {
  Send, CheckCircle2,
  Clock, Calculator, ShieldCheck, Mail
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { COMPANY } from '@/lib/constants';

export default function Estimates() {
  const [gutterChecked, setGutterChecked] = useState(false);
  const [gutterTier, setGutterTier] = useState(190);

  const [leakChecked, setLeakChecked] = useState(false);
  const [extraLeaksCount, setExtraLeaksCount] = useState(0);

  const [fasciaChecked, setFasciaChecked] = useState(false);
  const [soffitChecked, setSoffitChecked] = useState(false);

  const [downspoutReattachChecked, setDownspoutReattachChecked] = useState(false);
  const [newDownspoutRequired, setNewDownspoutRequired] = useState(false);

  const [heatWireChecked, setHeatWireChecked] = useState(false);
  const [heatWireFeet, setHeatWireFeet] = useState(1);

  const [christmasLightsChecked, setChristmasLightsChecked] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');

  const totals = useMemo(() => {
    let subtotal = 0;
    let customQuoteFlag = false;

    if (gutterChecked) subtotal += gutterTier;
    if (leakChecked) subtotal += 170 + (extraLeaksCount * 30);
    if (fasciaChecked) subtotal += 250;
    if (soffitChecked) subtotal += 195;
    if (downspoutReattachChecked) subtotal += 170;
    if (newDownspoutRequired) customQuoteFlag = true;

    if (heatWireChecked) {
      if (heatWireFeet >= 25) {
        customQuoteFlag = true;
      } else {
        subtotal += (heatWireFeet * 25) + 150;
      }
    }

    if (christmasLightsChecked) customQuoteFlag = true;

    const taxRate = 13;
    const taxAmount = (subtotal * taxRate) / 100;
    const finalTotal = subtotal + taxAmount;

    return { subtotal, taxAmount, finalTotal, customQuoteFlag };
  }, [
    gutterChecked, gutterTier, leakChecked, extraLeaksCount,
    fasciaChecked, soffitChecked, downspoutReattachChecked,
    newDownspoutRequired, heatWireChecked, heatWireFeet, christmasLightsChecked
  ]);

  const handleLocalMailDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !propertyAddress) return;

    const scopeDetails: string[] = [];
    if (gutterChecked) scopeDetails.push(`Gutter Cleaning (${gutterTier === 190 ? 'Bungalow' : 'Two-Story House'}: $${gutterTier})`);
    if (leakChecked) scopeDetails.push(`Leak Sealing ($170 Base + ${extraLeaksCount} Extra Corners at $30ea: $${170 + (extraLeaksCount * 30)})`);
    if (fasciaChecked) scopeDetails.push(`Fascia Reattach ($250.00)`);
    if (soffitChecked) scopeDetails.push(`Soffits Repair ($195.00)`);
    if (downspoutReattachChecked) scopeDetails.push(`Downspout Reattach ($170.00)`);
    if (newDownspoutRequired) scopeDetails.push(`New Downspout Required (Custom Quote Requested)`);
    if (heatWireChecked) {
      if (heatWireFeet >= 25) {
        scopeDetails.push(`Heat Wire Loop (${heatWireFeet} Linear Feet: Custom Quote Required for 25ft+)`);
      } else {
        scopeDetails.push(`Heat Wire Loop (${heatWireFeet} Linear Feet: $${(heatWireFeet * 25) + 150} incl. $150 Base Labor/Materials)`);
      }
    }
    if (christmasLightsChecked) scopeDetails.push(`Christmas Lights (Request Quote Triggered)`);

    const chosenItemsText = scopeDetails.join('%0D%0A - ');
    const mailSubject = `New Project Scope Estimate - ${fullName}`;

    const mailBody = `Hello Masbling Astar Services,%0D%0A%0D%0AI have generated a custom property estimation profile using the local tool layout:%0D%0A%0D%0A--- CLIENT PROFILE ---%0D%0AFull Name: ${fullName}%0D%0APhone: ${phone}%0D%0AProperty Address: ${propertyAddress}%0D%0A%0D%0A--- CONFIGURED WORK SCOPE ---%0D%0A - ${chosenItemsText}%0D%0A%0D%0A--- MATHEMATICAL BREAKDOWN ---%0D%0AEstimated Subtotal: $${totals.subtotal.toFixed(2)}%0D%0AOntario HST (13%): $${totals.taxAmount.toFixed(2)}%0D%0AEstimated Grand Total: $${totals.finalTotal.toFixed(2)}%0D%0A${totals.customQuoteFlag ? '%0D%0A* NOTE: This order contains items that require an on-site evaluation for a manual custom quote.' : ''}%0D%0A%0D%0APlease review my structural configuration and contact me to verify schedule availability.%0D%0A%0D%0AWeb Verification Token: https://masblingastarservices.com`;

    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(mailSubject)}&body=${mailBody}`;
  };

  const hasSelection = gutterChecked || leakChecked || fasciaChecked || soffitChecked || downspoutReattachChecked || newDownspoutRequired || heatWireChecked || christmasLightsChecked;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 text-navy-50 animate-fade-in">
      {/* Branding Header Ribbon */}
      <div className="flex items-center justify-between border-b border-navy-700 pb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gold-400" />
            Interactive Estimate Engine
          </h2>
          <p className="text-xs text-navy-300 mt-0.5">Select real service metrics to compile your exterior maintenance pricing locally</p>
        </div>
        <div className="text-xs font-semibold text-teal-400 bg-navy-800/40 border border-navy-700 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Mail Sandbox</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Interactive Input Option Tiers */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-1">1. Choose Structural Maintenance Options</p>

          {/* Item 1: Gutter Cleaning */}
          <div className={`card p-4 border transition-all rounded-xl ${gutterChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={gutterChecked} onChange={(e) => setGutterChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Gutter Cleaning</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Debris clearance extraction, flushing downpipes, and muck clearing.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{gutterChecked ? formatCurrency(gutterTier) : '$0.00'}</span>
            </div>
            {gutterChecked && (
              <div className="mt-3 pt-3 border-t border-dashed border-navy-700 animate-slide-up flex gap-3 items-center">
                <span className="text-[11px] font-semibold text-navy-300">Property Elevation Type:</span>
                <div className="flex gap-2 flex-1">
                  <button type="button" onClick={() => setGutterTier(190)} className={`flex-1 text-xs py-1.5 px-3 rounded-lg border font-semibold ${gutterTier === 190 ? 'bg-gold-400 text-navy-950 border-gold-400' : 'bg-navy-900 text-navy-300 border-navy-700 hover:border-navy-600'}`}>Bungalow ($190.00)</button>
                  <button type="button" onClick={() => setGutterTier(220)} className={`flex-1 text-xs py-1.5 px-3 rounded-lg border font-semibold ${gutterTier === 220 ? 'bg-gold-400 text-navy-950 border-gold-400' : 'bg-navy-900 text-navy-300 border-navy-700 hover:border-navy-600'}`}>Two-Story House ($220.00)</button>
                </div>
              </div>
            )}
          </div>

          {/* Item 2: Leak Sealing */}
          <div className={`card p-4 border transition-all rounded-xl ${leakChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={leakChecked} onChange={(e) => setLeakChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Leak Sealing</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Waterproof rubber sealant compound application to joint corners. Baseline includes first corner leak.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{leakChecked ? formatCurrency(170 + (extraLeaksCount * 30)) : '$0.00'}</span>
            </div>
            {leakChecked && (
              <div className="mt-3 pt-3 border-t border-dashed border-navy-700 animate-slide-up flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-navy-300">Additional Leaking Corners (+$30.00 each):</span>
                <div className="flex items-center gap-1.5 bg-navy-950 border border-navy-700 rounded-lg px-2 py-1">
                  <button type="button" disabled={extraLeaksCount <= 0} onClick={() => setExtraLeaksCount(prev => prev - 1)} className="text-navy-300 text-sm font-bold px-1.5 hover:text-navy-100 disabled:opacity-20">-</button>
                  <span className="text-sm font-bold text-navy-50 min-w-[1.5rem] text-center tabular-nums">{extraLeaksCount}</span>
                  <button type="button" disabled={extraLeaksCount >= 20} onClick={() => setExtraLeaksCount(prev => prev + 1)} className="text-navy-300 text-sm font-bold px-1.5 hover:text-navy-100 disabled:opacity-20">+</button>
                </div>
              </div>
            )}
          </div>

          {/* Item 3: Fascia Reattach */}
          <div className={`card p-4 border transition-all rounded-xl ${fasciaChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={fasciaChecked} onChange={(e) => setFasciaChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Fascia Reattach</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Re-secure loose or detached fascia boards to the roof edge structure.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{fasciaChecked ? formatCurrency(250) : '$0.00'}</span>
            </div>
          </div>

          {/* Item 4: Soffits Repair */}
          <div className={`card p-4 border transition-all rounded-xl ${soffitChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={soffitChecked} onChange={(e) => setSoffitChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Soffits Repair</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Repair or replace damaged soffit panels under the eaves.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{soffitChecked ? formatCurrency(195) : '$0.00'}</span>
            </div>
          </div>

          {/* Item 5: Downspout Reattach / New Downspout */}
          <div className={`card p-4 border transition-all rounded-xl ${(downspoutReattachChecked || newDownspoutRequired) ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={downspoutReattachChecked} onChange={(e) => setDownspoutReattachChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Downspout Reattach</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Re-secure loose or detached downspouts to the wall. Flat rate per reattachment.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{downspoutReattachChecked ? formatCurrency(170) : '$0.00'}</span>
            </div>
            {(downspoutReattachChecked || newDownspoutRequired) && (
              <div className="mt-3 pt-3 border-t border-dashed border-navy-700 animate-slide-up flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={newDownspoutRequired} onChange={(e) => setNewDownspoutRequired(e.target.checked)} className="accent-gold-400 w-4 h-4" />
                  <span className="text-[11px] font-semibold text-navy-300">New Downspout Required (Custom Quote)</span>
                </label>
                {newDownspoutRequired && (
                  <span className="text-[11px] font-bold text-gold-400 bg-gold-900/30 border border-gold-700 rounded px-2 py-0.5">Custom Quote</span>
                )}
              </div>
            )}
          </div>

          {/* Item 6: Heat Wire Loop */}
          <div className={`card p-4 border transition-all rounded-xl ${heatWireChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={heatWireChecked} onChange={(e) => setHeatWireChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Heat Wire Loop</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Heated cable to prevent ice dams. $25/ft + $150 base labor/materials. 25ft+ requires custom quote.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">
                {heatWireChecked ? (heatWireFeet >= 25 ? 'Custom Quote' : formatCurrency((heatWireFeet * 25) + 150)) : '$0.00'}
              </span>
            </div>
            {heatWireChecked && (
              <div className="mt-3 pt-3 border-t border-dashed border-navy-700 animate-slide-up flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-navy-300">Linear Feet:</span>
                <div className="flex items-center gap-1.5 bg-navy-950 border border-navy-700 rounded-lg px-2 py-1">
                  <button type="button" disabled={heatWireFeet <= 1} onClick={() => setHeatWireFeet(prev => prev - 1)} className="text-navy-300 text-sm font-bold px-1.5 hover:text-navy-100 disabled:opacity-20">-</button>
                  <span className="text-sm font-bold text-navy-50 min-w-[2rem] text-center tabular-nums">{heatWireFeet} ft</span>
                  <button type="button" disabled={heatWireFeet >= 99} onClick={() => setHeatWireFeet(prev => prev + 1)} className="text-navy-300 text-sm font-bold px-1.5 hover:text-navy-100 disabled:opacity-20">+</button>
                </div>
              </div>
            )}
          </div>

          {/* Item 7: Christmas Lights Installation */}
          <div className={`card p-4 border transition-all rounded-xl ${christmasLightsChecked ? 'border-gold-400 bg-navy-800/60 shadow-lg' : 'border-navy-700 bg-navy-800/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                <input type="checkbox" checked={christmasLightsChecked} onChange={(e) => setChristmasLightsChecked(e.target.checked)} className="mt-1 accent-gold-400 w-4 h-4" />
                <div>
                  <span className="text-sm font-bold block">Christmas Lights Installation</span>
                  <span className="text-xs text-navy-300 block mt-0.5">Seasonal holiday lighting setup and takedown. Requires on-site custom quote.</span>
                </div>
              </label>
              <span className="text-sm font-black text-gold-400 shrink-0">{christmasLightsChecked ? 'Custom Quote' : '$0.00'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Live Calculation Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4 rounded-xl border border-navy-700 bg-navy-800/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-navy-700 bg-navy-900/50">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-gold-400" />
                Live Estimate Summary
              </h3>
            </div>

            <div className="p-4 space-y-2">
              {!hasSelection && (
                <p className="text-xs text-navy-400 text-center py-6">Select services to see pricing</p>
              )}

              {gutterChecked && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Gutter Cleaning ({gutterTier === 190 ? 'Bungalow' : '2-Story'})</span>
                  <span className="font-semibold text-navy-50">{formatCurrency(gutterTier)}</span>
                </div>
              )}
              {leakChecked && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Leak Sealing {extraLeaksCount > 0 && `(+${extraLeaksCount})`}</span>
                  <span className="font-semibold text-navy-50">{formatCurrency(170 + (extraLeaksCount * 30))}</span>
                </div>
              )}
              {fasciaChecked && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Fascia Reattach</span>
                  <span className="font-semibold text-navy-50">{formatCurrency(250)}</span>
                </div>
              )}
              {soffitChecked && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Soffits Repair</span>
                  <span className="font-semibold text-navy-50">{formatCurrency(195)}</span>
                </div>
              )}
              {downspoutReattachChecked && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Downspout Reattach</span>
                  <span className="font-semibold text-navy-50">{formatCurrency(170)}</span>
                </div>
              )}
              {heatWireChecked && heatWireFeet < 25 && (
                <div className="flex justify-between text-xs">
                  <span className="text-navy-300">Heat Wire ({heatWireFeet} ft)</span>
                  <span className="font-semibold text-navy-50">{formatCurrency((heatWireFeet * 25) + 150)}</span>
                </div>
              )}
              {(newDownspoutRequired || (heatWireChecked && heatWireFeet >= 25) || christmasLightsChecked) && (
                <div className="flex justify-between text-xs">
                  <span className="text-gold-400 font-semibold">Custom Quote Items</span>
                  <span className="font-semibold text-gold-400">On-site</span>
                </div>
              )}

              {hasSelection && (
                <>
                  <div className="border-t border-navy-700 pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-400">Subtotal</span>
                      <span className="font-semibold text-navy-50">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-400">HST (13%)</span>
                      <span className="font-semibold text-navy-50">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                  </div>
                  <div className="border-t border-navy-700 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-navy-200">Estimated Total</span>
                    <span className="text-lg font-black text-gold-400">{formatCurrency(totals.finalTotal)}</span>
                  </div>
                  {totals.customQuoteFlag && (
                    <div className="mt-2 text-[11px] text-gold-300 bg-gold-900/20 border border-gold-700/50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Some items require an on-site evaluation for a final custom quote.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Information & Dispatch Form */}
      <div className="card rounded-xl border border-navy-700 bg-navy-800/40 p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-navy-400">2. Enter Your Contact Details</p>
        <form onSubmit={handleLocalMailDispatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-navy-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-50 placeholder:text-navy-600 focus:border-gold-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-navy-400 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="437-440-4072"
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-50 placeholder:text-navy-600 focus:border-gold-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-navy-400 mb-1">Property Address</label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              required
              placeholder="123 Main St, Brampton ON"
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-50 placeholder:text-navy-600 focus:border-gold-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between gap-4 pt-2">
            <div className="text-xs text-navy-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Opens your email app with a pre-filled estimate</span>
            </div>
            <button
              type="submit"
              disabled={!hasSelection || !fullName || !phone || !propertyAddress}
              className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 disabled:bg-navy-700 disabled:text-navy-500 text-navy-950 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Estimate Request
            </button>
          </div>
        </form>
      </div>

      {/* Quick Status Indicators */}
      {hasSelection && (
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {gutterChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Gutter
            </span>
          )}
          {leakChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Leak Sealing
            </span>
          )}
          {fasciaChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Fascia
            </span>
          )}
          {soffitChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Soffits
            </span>
          )}
          {downspoutReattachChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Downspout
            </span>
          )}
          {heatWireChecked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-300 bg-success-900/30 border border-success-700/50 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Heat Wire
            </span>
          )}
          {totals.customQuoteFlag && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-400 bg-gold-900/30 border border-gold-700/50 rounded-full px-2.5 py-1">
              <Clock className="w-3 h-3" /> Custom Quote Needed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
