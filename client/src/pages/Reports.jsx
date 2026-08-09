import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import toast from 'react-hot-toast';
import { FileBarChart, Download, Printer, Filter, Building2, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('COMPLIANCE');
  const [year, setYear] = useState('2026');
  const [district, setDistrict] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await API.get('/reports', {
        params: {
          reportType,
          year,
          district: district || undefined,
        },
      });
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, year, district]);

  // Export to Excel / CSV format
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export.');
      return;
    }

    const keys = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(keys.join(','));

    for (const row of data) {
      const values = keys.map((k) => {
        const val = row[k];
        return `"${val !== undefined && val !== null ? val : ''}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${reportType}_Report_${year}.csv`);
    a.click();
    toast.success('Report exported to Excel / CSV.');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Generate executive summary reports and export formatted files.</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center no-print">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Report Category</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <option value="COMPLIANCE">Department Compliance Report</option>
            <option value="MEETING_TYPE">Meeting Type Distribution Report</option>
            <option value="DISTRICT">District Wise Summary Report</option>
            <option value="MONTHLY">Monthly Meetings Aggregation</option>
            <option value="QUARTERLY">Quarterly Executive Report</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Generated Report View Container */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{reportType.replace(/_/g, ' ')} REPORT</h3>
            <p className="text-xs text-slate-500">Government Meeting Management System • Generated Year {year}</p>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : reportType === 'COMPLIANCE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Department Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4 text-center">Total Actions</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">In Progress</th>
                  <th className="py-3 px-4 text-center">Pending</th>
                  <th className="py-3 px-4 text-right">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
                {data.map((row) => (
                  <tr key={row.departmentId}>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{row.departmentCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{row.departmentName}</td>
                    <td className="py-3 px-4 text-center font-bold">{row.totalActions}</td>
                    <td className="py-3 px-4 text-center text-teal-600 font-bold">{row.completedActions}</td>
                    <td className="py-3 px-4 text-center text-indigo-600">{row.inProgressActions}</td>
                    <td className="py-3 px-4 text-center text-rose-600">{row.pendingActions}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold ${row.complianceRatePercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {row.complianceRatePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                  {data[0] && Object.keys(data[0]).map((key) => (
                    <th key={key} className="py-3 px-4">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
