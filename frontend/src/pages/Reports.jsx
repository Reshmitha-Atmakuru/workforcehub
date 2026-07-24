import React, { useEffect, useState } from 'react';
import API from '../services/api';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Users,
  Briefcase,
  CheckSquare,
} from 'lucide-react';

export default function Reports() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'productivity' : 'projects');
  const [productivityData, setProductivityData] = useState([]);
  const [projectHealthData, setProjectHealthData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const requests = [
        API.get('/reports/project-health'),
        API.get('/reports/task-status')
      ];
      if (isAdmin) {
        requests.push(API.get('/reports/employee-productivity'));
      }
      
      const responses = await Promise.all(requests);
      
      const projList = Array.isArray(responses[0]?.data)
        ? responses[0].data
        : (Array.isArray(responses[0]?.data?.data) ? responses[0].data.data : []);
      
      const taskList = Array.isArray(responses[1]?.data)
        ? responses[1].data
        : (Array.isArray(responses[1]?.data?.data) ? responses[1].data.data : []);
      
      setProjectHealthData(projList);
      setTaskStatusData(taskList);
      
      if (isAdmin && responses[2]) {
        const prodList = Array.isArray(responses[2]?.data)
          ? responses[2].data
          : (Array.isArray(responses[2]?.data?.data) ? responses[2].data.data : []);
        setProductivityData(prodList);
      }
    } catch (err) {
      console.error('Error fetching report analytics:', err);
      setProductivityData([]);
      setProjectHealthData([]);
      setTaskStatusData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    let exportSheetData = [];
    let fileName = 'WorkforceHub_Report.xlsx';

    if (activeTab === 'productivity') {
      exportSheetData = productivityData;
      fileName = 'Workforce_Employee_Productivity_Report.xlsx';
    } else if (activeTab === 'projects') {
      exportSheetData = projectHealthData;
      fileName = 'Workforce_Project_Portfolio_Health_Report.xlsx';
    } else {
      exportSheetData = taskStatusData;
      fileName = 'Workforce_Task_Status_Report.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(exportSheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ReportData');
    XLSX.writeFile(wb, fileName);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('WorkforceHub India Pvt. Ltd. - Executive Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Report Type: ${activeTab.toUpperCase()}`, 14, 34);

    let y = 45;
    if (activeTab === 'productivity') {
      productivityData.forEach((item, index) => {
        doc.text(
          `${index + 1}. [${item.employeeCode}] ${item.employeeName} (${item.department}) - Assigned: ${item.totalAssigned}, Completed: ${item.completed}, Rate: ${item.completionRate}`,
          14,
          y
        );
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    } else if (activeTab === 'projects') {
      projectHealthData.forEach((item, index) => {
        doc.text(
          `${index + 1}. [${item.projectCode}] ${item.projectName} - Dept: ${item.department}, Status: ${item.status}, Progress: ${item.progress}%, Budget: INR ${item.budget}`,
          14,
          y
        );
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      taskStatusData.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.taskTitle} - Project: ${item.projectName}, Assigned: ${item.assignedTo}, Priority: ${item.priority}, Status: ${item.status}, Due: ${item.dueDate}`,
          14,
          y
        );
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(`WorkforceHub_${activeTab}_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Executive Analytics & Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable PDF documents and Excel data exports for corporate review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={exportPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'productivity'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employee-wise Task Report</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Project Progress Report</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Pending Task Report</span>
        </button>
      </div>

      {/* Report Tables */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Generating report data...</div>
        ) : activeTab === 'productivity' && isAdmin ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131e3b] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Total Assigned</th>
                  <th className="py-3.5 px-4 text-center">Completed</th>
                  <th className="py-3.5 px-4 text-center">Pending</th>
                  <th className="py-3.5 px-4 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {(Array.isArray(productivityData) ? productivityData : []).map((row) => (
                  <tr key={row.employeeCode} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{row.employeeCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{row.employeeName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.department}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{row.totalAssigned}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400">{row.completed}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-300">{row.pending}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-400">{row.completionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'projects' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131e3b] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Project Code</th>
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {(Array.isArray(projectHealthData) ? projectHealthData : []).map((row) => (
                  <tr key={row.projectCode} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{row.projectCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{row.projectName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.department}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        row.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">₹{row.budget?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-300">{row.deadline}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-400">{row.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131e3b] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Project Scope</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {(Array.isArray(taskStatusData) ? taskStatusData : []).map((row, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{row.taskTitle}</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.projectName}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{row.assignedTo}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        row.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : row.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        row.status === 'DONE' || row.status === 'Completed' || row.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-300">{row.dueDate}</td>
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
