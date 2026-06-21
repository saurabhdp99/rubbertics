import React, { useState } from 'react';

const initialForm = {
  // Part Details
  partName: '',
  partNo: '',
  aliasName: '',

  // Drawing Details
  customerDrawingNo: '',
  drawingRevisionNo: '',
  npplDrawingNo: '',
  drawingDate: '',

  // Mould / Drawing Details
  mdPartName: '',
  mdPartNo: '',
  mdDrawingNo: '',
  mdDrawingRevNo: '',
  mdNoOfDowellPin: '',
  mdMouldNo: '',
  mdMouldSize: '',
  mdMouldType: '',
  mdNoOfCavity: '',
  mdNoOfPlateMould: '',

  // Compound Details
  compoundDetails: '',
  sheetSize: '',
  hardness: '',
  colour: '',

  // Machine Parameter
  machineTonnage: '',
  machinePlattenSize: '',
  topTemperature: '',
  vaccumeRequired: '',
  bottomTemperature: '',
  vaccumeOpenDelay: '',
  pressure: '',
  bumpingCount: '',
  curingTime: '',
  machineNo: '',
  cycleTime: '',
  intermediateBumping: '',
  degasOpenTime: '',
  degasHoldTime: '',

  // Problems Come In Product (Checkboxes)
  problems: {
    airTrapment: false,
    shortFeed: false,
    trash: false,
    underCure: false,
    tear: false,
    blow: false,
    bondFailure: false,
    cutMark: false,
    flashMould: false,
    weldLine: false,
    carbon: false,
    blackMark: false,
    overCure: false
  },

  // Footer / Signatures
  preparedBy: '',
  approvedBy: '',
  formatNo: 'NP/P/76',
  revNo: '00/00',

  // Filing Method & Feeding Details
  filingMethod: '',
  grossWeight: '',
  netWeight: '',
  feedingMethod: '',
  dimOfFeedStrip: '',
  weightOfStrip: '',
  noOfStrip: '',

  // Rejection Identification
  rejectionIdentification: '',

  // Observation & Action
  pointToBeObserved: '',
  actionTaken: ''
};

const problemLabels = [
  { key: 'airTrapment', label: '1) AIR TRAPMENT' },
  { key: 'shortFeed', label: '2) SHORT FEED' },
  { key: 'trash', label: '3) TRASH' },
  { key: 'underCure', label: '4) UNDER CURE' },
  { key: 'tear', label: '5) TEAR (from hole side)' },
  { key: 'blow', label: '6) BLOW' },
  { key: 'bondFailure', label: '7) BOND FAILURE' },
  { key: 'cutMark', label: '8) CUT MARK' },
  { key: 'flashMould', label: '9) FLASH MOULD' },
  { key: 'weldLine', label: '10) WELD LINE' },
  { key: 'carbon', label: '11) CARBON' },
  { key: 'blackMark', label: '12) BLACK MARK' },
  { key: 'overCure', label: '13) OVER CURE' },
];

export default function ProcessControlStandardPage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const problemKey = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        problems: { ...prev.problems, [problemKey]: checked }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Process Control Standard submitted:', form);
    alert('Process Control Standard submitted successfully!');
  };

  const inputClass =
    'w-full input-glow rounded-lg px-3 py-2 text-sm text-slate-800';

  const labelClass = 'text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 ml-1';

  const sectionHeaderClass = 'bg-slate-50/50 py-2 px-4 border-y border-slate-100 mb-6 flex items-center gap-3';
  const sectionTitleClass = 'text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em]';

  return (
    <div className="p-3 max-w-6xl mx-auto animate-slide-up">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-emerald-600 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-700/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <div className="w-14 h-8 bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600 italic tracking-tighter">NISARG</div>
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight uppercase leading-none">Nisarg Polymers Pvt Ltd.</h1>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5 opacity-80">Precision Rubber Solutions</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 relative z-10">
            <h2 className="text-white text-sm font-black tracking-[0.15em] uppercase">Process Control Standard</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Part Details */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Part Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="md:col-span-1">
              <label className={labelClass}>Part Name</label>
              <input name="partName" value={form.partName} onChange={handleChange} className={inputClass} placeholder="e.g. Engine Gasket" />
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Part No.</label>
              <input name="partNo" value={form.partNo} onChange={handleChange} className={inputClass} placeholder="P-10023-A" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Alias Name</label>
              <input name="aliasName" value={form.aliasName} onChange={handleChange} className={inputClass} placeholder="Enter alternative name if any" />
            </div>
          </div>

          {/* Drawing Details */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Drawing Details</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div>
              <label className={labelClass}>Customer Drg No.</label>
              <input name="customerDrawingNo" value={form.customerDrawingNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Revision No.</label>
              <input name="drawingRevisionNo" value={form.drawingRevisionNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NPPL Drg No.</label>
              <input name="npplDrawingNo" value={form.npplDrawingNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Drawing Date</label>
              <input name="drawingDate" type="date" value={form.drawingDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Mould / Drawing Details */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Mould / Drawing Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Part Name</label>
                <input name="mdPartName" value={form.mdPartName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Part No</label>
                <input name="mdPartNo" value={form.mdPartNo} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Drawing No</label>
                <input name="mdDrawingNo" value={form.mdDrawingNo} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Drawing Rev. No</label>
                  <input name="mdDrawingRevNo" value={form.mdDrawingRevNo} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Dowell Pin Qty</label>
                  <input name="mdNoOfDowellPin" value={form.mdNoOfDowellPin} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Mould No</label>
                  <input name="mdMouldNo" value={form.mdMouldNo} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Mould Size</label>
                  <input name="mdMouldSize" value={form.mdMouldSize} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Mould Type</label>
                <input name="mdMouldType" value={form.mdMouldType} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>No. Of Cavity</label>
                  <input name="mdNoOfCavity" value={form.mdNoOfCavity} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Plate Mould Qty</label>
                  <input name="mdNoOfPlateMould" value={form.mdNoOfPlateMould} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Compound Details */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Compound Details</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div>
              <label className={labelClass}>Compound Desc.</label>
              <input name="compoundDetails" value={form.compoundDetails} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sheet Size</label>
              <input name="sheetSize" value={form.sheetSize} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hardness</label>
              <input name="hardness" value={form.hardness} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Colour</label>
              <input name="colour" value={form.colour} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Machine Parameter */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Machine Parameter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
            <div className="space-y-4">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Machine Tonnage</label>
                  <input name="machineTonnage" value={form.machineTonnage} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Top Temp.</label>
                  <input name="topTemperature" value={form.topTemperature} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Bottom Temp.</label>
                  <input name="bottomTemperature" value={form.bottomTemperature} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Pressure</label>
                  <input name="pressure" value={form.pressure} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Curing Time</label>
                  <input name="curingTime" value={form.curingTime} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Cycle Time</label>
                  <input name="cycleTime" value={form.cycleTime} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Degas Open Time</label>
                <input name="degasOpenTime" value={form.degasOpenTime} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Platten Size</label>
                  <input name="machinePlattenSize" value={form.machinePlattenSize} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Vaccume Req.</label>
                  <input name="vaccumeRequired" value={form.vaccumeRequired} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Vaccume Delay</label>
                  <input name="vaccumeOpenDelay" value={form.vaccumeOpenDelay} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Bumping Count</label>
                  <input name="bumpingCount" value={form.bumpingCount} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className={labelClass}>Machine No</label>
                  <input name="machineNo" value={form.machineNo} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Int. Bumping</label>
                  <input name="intermediateBumping" value={form.intermediateBumping} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Degas Hold Time</label>
                <input name="degasHoldTime" value={form.degasHoldTime} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Problems and Sketch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <div className="bg-slate-900 text-white text-[10px] font-black py-2.5 px-5 mb-4 flex justify-between uppercase tracking-[0.2em] rounded-xl shadow-lg">
                <span>Production Issues Checklist</span>
                <span>Found?</span>
              </div>
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                {problemLabels.map((item, idx) => (
                  <label key={item.key} className={`flex items-center justify-between px-5 py-2.5 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'} hover:bg-emerald-50 group`}>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700">{item.label}</span>
                    <input
                      type="checkbox"
                      name={`problems.${item.key}`}
                      checked={form.problems[item.key]}
                      onChange={handleChange}
                      className="w-5 h-5 accent-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500 transition-transform group-active:scale-90"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-slate-900 text-white text-[10px] font-black py-2.5 px-5 mb-4 text-center uppercase tracking-[0.2em] rounded-xl shadow-lg">
                Reference Sketch / Photo
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[350px] flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Upload Component Image</span>
                <p className="text-[9px] text-slate-300 mt-2 font-medium">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Prepared/Approved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-slate-100 pt-10">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Prepared By</label>
                <input name="preparedBy" value={form.preparedBy} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex flex-col justify-end pb-1">
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Format No:</span>
                  <span className="ml-2 text-[10px] text-slate-600 font-bold">{form.formatNo}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Approved By</label>
                <input name="approvedBy" value={form.approvedBy} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex flex-col justify-end pb-1">
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Rev No:</span>
                  <span className="ml-2 text-[10px] text-slate-600 font-bold">{form.revNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filing Method & Feeding Details */}
          <div className={sectionHeaderClass}>
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className={sectionTitleClass}>Methodology & Feeding</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <label className={labelClass}>Filing Method Details</label>
              <textarea
                name="filingMethod"
                rows={7}
                value={form.filingMethod}
                onChange={handleChange}
                className={`${inputClass} resize-none h-[calc(100%-24px)]`}
                placeholder="Detailed filing and finishing process description..."
              />
            </div>
            <div className="bg-emerald-600 rounded-2xl p-6 shadow-xl shadow-emerald-200/50 flex flex-col justify-between">
              <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center opacity-80">Feeding Parameters</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">Gross Wt.</label>
                  <input name="grossWeight" value={form.grossWeight} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="14.4 ±0.2 g" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">Net Weight</label>
                  <input name="netWeight" value={form.netWeight} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="1.8 g" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">Feeding Method</label>
                  <input name="feedingMethod" value={form.feedingMethod} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="STRIP FEEDING" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">Dim. Of Feed Strip</label>
                  <input name="dimOfFeedStrip" value={form.dimOfFeedStrip} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="13x1mmX10mmX2.5mm" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">Strip Weight</label>
                  <input name="weightOfStrip" value={form.weightOfStrip} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="0.57 g" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block mb-1">No Of Strips</label>
                  <input name="noOfStrip" value={form.noOfStrip} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-300 focus:outline-none focus:bg-white/20 transition-all" placeholder="09" />
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Identification */}
          <div className="mb-10">
            <label className={labelClass}>Rejection Identification & Traceability</label>
            <textarea
              name="rejectionIdentification"
              rows={2}
              value={form.rejectionIdentification}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              placeholder="Explain how rejections are identified..."
            />
          </div>

          {/* Point to be Observed & Action Taken */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
              <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-2">Points To Be Observed:</label>
              <textarea
                name="pointToBeObserved"
                rows={4}
                value={form.pointToBeObserved}
                onChange={handleChange}
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all resize-none"
              />
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-2">Action Taken / Preventive Measures:</label>
              <textarea
                name="actionTaken"
                rows={4}
                value={form.actionTaken}
                onChange={handleChange}
                className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-[0.2em]"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="btn-primary px-10 py-3 rounded-xl text-xs font-black text-white shadow-xl shadow-emerald-500/30 uppercase tracking-[0.2em]"
            >
              Generate Standard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
