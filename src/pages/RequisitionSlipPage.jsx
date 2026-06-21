import React, { useState } from 'react';

const initialForm = {
  enquiryNo: '',
  enquiryDate: '',
  projectName: '',
  customerName: '',
  partName: '',
  partNo: '',
  samplingType: '',
  samplingDate: '',
  compoundName: '',
  colour: '',
  hardness: '',
  specialReq: '',
  lotNo: '',
  samplingQty: '',
  machineNo: '',
  mouldNo: '',
  topTemp: '',
  bottomTemp: '',
  curingTime: '',
  cycleTime: '',
  shotWeight: '',
  partNetWeight: '',
  sampleResult: '',
  sampleObservation: '',
  challanNo: '',
  challanDate: '',
  courierName: '',
  courierDetails: '',
  requestedBy: '',
  preparedBy: '',
  qcCheckedBy: '',
  approvedBy: '',
};

export default function RequisitionSlipPage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Requisition Slip submitted:', form);
    alert('Requisition Slip submitted successfully!');
  };

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800';

  const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1';

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-center">
          <h1 className="text-white text-lg font-bold tracking-wide uppercase">Sample Trial Requisition Slip</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Two-column rows matching the screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <label className={labelClass}>Enquiry No.</label>
              <input name="enquiryNo" value={form.enquiryNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Enquiry Date.</label>
              <input name="enquiryDate" type="date" value={form.enquiryDate} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Project Name.</label>
              <input name="projectName" value={form.projectName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Customer Name.</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Part Name.</label>
              <input name="partName" value={form.partName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Part No.</label>
              <input name="partNo" value={form.partNo} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Sampling Type.</label>
              <input name="samplingType" value={form.samplingType} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sampling Date</label>
              <input name="samplingDate" type="date" value={form.samplingDate} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Compound Name.</label>
              <input name="compoundName" value={form.compoundName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Colour.</label>
              <input name="colour" value={form.colour} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Hardness.</label>
              <input name="hardness" value={form.hardness} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Special Req.</label>
              <input name="specialReq" value={form.specialReq} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Lot No.</label>
              <input name="lotNo" value={form.lotNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sampling Qty.</label>
              <input name="samplingQty" value={form.samplingQty} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Machine No.</label>
              <input name="machineNo" value={form.machineNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mould No.</label>
              <input name="mouldNo" value={form.mouldNo} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Top Temp.</label>
              <input name="topTemp" value={form.topTemp} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bottom Temp.</label>
              <input name="bottomTemp" value={form.bottomTemp} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Curing Time.</label>
              <input name="curingTime" value={form.curingTime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cycle Time.</label>
              <input name="cycleTime" value={form.cycleTime} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Shot Weight.</label>
              <input name="shotWeight" value={form.shotWeight} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Part Net Weight.</label>
              <input name="partNetWeight" value={form.partNetWeight} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Sample Observation & Result */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Sample Observation & Internal Sample Result</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sampleResult"
                  value="accepted"
                  checked={form.sampleResult === 'accepted'}
                  onChange={handleChange}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Accepted</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sampleResult"
                  value="rejected"
                  checked={form.sampleResult === 'rejected'}
                  onChange={handleChange}
                  className="accent-red-600 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Rejected</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sampleResult"
                  value="conditionally-accepted"
                  checked={form.sampleResult === 'conditionally-accepted'}
                  onChange={handleChange}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Conditionally Accepted</span>
              </label>
            </div>

            <div>
              <label className={labelClass}>Observation Details</label>
              <textarea
                name="sampleObservation"
                rows={3}
                value={form.sampleObservation}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Challan & Courier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <label className={labelClass}>Challan No.</label>
              <input name="challanNo" value={form.challanNo} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Challan Date.</label>
              <input name="challanDate" type="date" value={form.challanDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Courier Name.</label>
              <input name="courierName" value={form.courierName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Courier Details.</label>
              <input name="courierDetails" value={form.courierDetails} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 mb-8">
            <div>
              <label className={labelClass}>Requested By.</label>
              <input name="requestedBy" value={form.requestedBy} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prepared By.</label>
              <input name="preparedBy" value={form.preparedBy} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>QC Checked By.</label>
              <input name="qcCheckedBy" value={form.qcCheckedBy} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Approved By.</label>
              <input name="approvedBy" value={form.approvedBy} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
