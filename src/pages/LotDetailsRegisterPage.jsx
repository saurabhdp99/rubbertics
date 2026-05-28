import React from 'react';
import { ClipboardList, ExternalLink, Search, Filter, Download } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';

const LotDetailsRegisterPage = () => {
  const columns = [
    { header: 'SR NO', accessor: 'srNo', align: 'center', width: 'w-16' },
    { header: 'DATE', accessor: 'date', align: 'center' },
    { header: 'PART NAME', accessor: 'partName' },
    { header: 'LOT NO', accessor: 'lotNo', align: 'center' },
    { header: 'ORDER QTY', accessor: 'orderQty', align: 'center' },
    { header: 'PRODUCTION QTY', accessor: 'productionQty', align: 'center' },
    { header: 'PENDING QTY', accessor: 'pendingQty', align: 'center' },
    { 
      header: 'OPEN/CLOSED', 
      accessor: 'status', 
      align: 'center',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          value === 'OPEN' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {value}
        </span>
      )
    },
    { 
      header: 'DOCUMENTS', 
      accessor: 'docLink', 
      align: 'center',
      render: (value) => (
        <a 
          href="#" 
          className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-1 hover:underline underline-offset-4 decoration-2"
        >
          {value}
          <ExternalLink size={12} />
        </a>
      )
    },
    { header: 'REMARK', accessor: 'remark' },
  ];

  const data = [
    { 
      id: 'lot-1',
      srNo: 1, 
      date: '2026-05-01', 
      partName: 'EYE ROLLER', 
      lotNo: '272025-03', 
      orderQty: 0, 
      productionQty: 3030, 
      pendingQty: 1970, 
      status: 'CLOSED', 
      docLink: "272025-03''A1", 
      remark: '' 
    },
    { 
      id: 'lot-2',
      srNo: 2, 
      date: '2026-05-01', 
      partName: 'FOOD HUB AIRVENT', 
      lotNo: '272025-08', 
      orderQty: 0, 
      productionQty: 48718, 
      pendingQty: -8718, 
      status: 'CLOSED', 
      docLink: "272025-08''A1", 
      remark: '' 
    },
    { 
      id: 'lot-3',
      srNo: 3, 
      date: '2026-05-02', 
      partName: '206 O RING', 
      lotNo: '272025-12', 
      orderQty: 0, 
      productionQty: 51322, 
      pendingQty: -1322, 
      status: 'CLOSED', 
      docLink: "272025-12''A1", 
      remark: '' 
    },
    { 
      id: 'lot-4',
      srNo: 4, 
      date: '2026-05-02', 
      partName: 'SQ SEET', 
      lotNo: '272025-16', 
      orderQty: 0, 
      productionQty: 253, 
      pendingQty: -23, 
      status: 'CLOSED', 
      docLink: "272025-16''A1", 
      remark: '' 
    },
    { 
      id: 'lot-5',
      srNo: 5, 
      date: '2026-05-03', 
      partName: 'SQ R RING', 
      lotNo: '272025-17', 
      orderQty: 0, 
      productionQty: 112, 
      pendingQty: 38, 
      status: 'CLOSED', 
      docLink: "272025-17''A1", 
      remark: '' 
    },
    { 
      id: 'lot-6',
      srNo: 6, 
      date: '2026-05-03', 
      partName: 'BIG MORI BUSH COLOUR', 
      lotNo: '272025-19', 
      orderQty: 0, 
      productionQty: 3335, 
      pendingQty: 665, 
      status: 'CLOSED', 
      docLink: "272025-19''A1", 
      remark: '' 
    },
  ];

  return (
    <div className="p-8 animate-slide-up">
      <PageHeader 
        icon={ClipboardList} 
        title="Lot Details Register" 
        description="Monitor and track lot-wise production quantities, order statuses, and documentation."
        showLiveSync={true}
        theme="emerald"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Part Name or Lot No..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} />
            Filters
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 uppercase tracking-wider">
            Add New Entry
          </button>
          <button className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <DataTable 
          columns={columns} 
          data={data} 
          minWidth="1400px"
        />
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Total Lots', value: '1,284', trend: '+12.5%', color: 'emerald' },
          { label: 'Open Lots', value: '42', trend: '-2.4%', color: 'amber' },
          { label: 'Production Units', value: '8.4M', trend: '+8.1%', color: 'indigo' },
          { label: 'Pending Units', value: '1.2M', trend: '+5.2%', color: 'slate' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-transform cursor-pointer">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotDetailsRegisterPage;
