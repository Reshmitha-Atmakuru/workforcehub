import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  UserCheck,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Employees({ isModalOpen, setIsModalOpen }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('code');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Edit / Delete State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('All');
    setRole('All');
    setStatus('All');
    setSortBy('code');
    setSortOrder('DESC');
    setPage(0);
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, role, status, sortBy, sortOrder, page, size]);

  const fetchEmployees = async () => {
    try {
      const params = { page, size };
      if (search) params.search = search;
      if (department && department !== 'All') params.department = department;
      if (role && role !== 'All') params.role = role;
      if (status && status !== 'All') params.status = status;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.direction = sortOrder;  // Backend expects 'direction', not 'sortOrder'

      const res = await API.get('/employees', { params });
      // Handle Spring Boot Page response: {content: [...]} or flat array or mock {data: [...]}
      let data = [];
      if (res.data && Array.isArray(res.data.content)) {
        data = res.data.content;
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || data.length);
      } else if (Array.isArray(res.data)) {
        data = res.data;
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
        setTotalPages(1);
        setTotalElements(data.length);
      }
      // Ensure salary is a number for proper formatting
      data = data.map(e => ({
        ...e,
        salary: e.salary !== undefined && e.salary !== null ? Number(e.salary) : 1200000,
      }));
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedEmp(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '+91 98765 43210',
      department: 'Engineering',
      customDepartment: '',
      jobTitle: 'Software Engineer',
      accountRole: 'ROLE_EMPLOYEE',
      salary: 1400000,
      status: 'ACTIVE',
      officeLocation: 'Bengaluru, Karnataka',
      skills: 'Full Stack Development, System Architecture',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Engineering',
      customDepartment: '',
      jobTitle: emp.jobTitle || '',
      accountRole: emp.accountRole || 'ROLE_EMPLOYEE',
      salary: emp.salary || 1400000,
      status: emp.status || 'ACTIVE',
      officeLocation: emp.officeLocation || 'Bengaluru, Karnataka',
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : emp.skills || '',
    });
    setIsModalOpen(true);
  };

  const [toastMessage, setToastMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const deptName = formData.department === 'Others' && formData.customDepartment
        ? formData.customDepartment
        : formData.department;

      const skillsList = typeof formData.skills === 'string'
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(formData.skills) ? formData.skills : []);

      const payload = {
        ...formData,
        department: deptName || 'Engineering',
        salary: Number(formData.salary) || 1200000,
        skills: skillsList.length > 0 ? skillsList : ['Full Stack Development'],
      };

      if (selectedEmp) {
        const res = await API.put(`/employees/${selectedEmp.id}`, payload);
        const updatedItem = res.data?.data || res.data;
        setEmployees(employees.map(emp => emp.id === selectedEmp.id ? updatedItem : emp));
        setToastMessage(`Employee ${payload.firstName} ${payload.lastName} updated successfully!`);
      } else {
        const res = await API.post('/employees', payload);
        const newItem = res.data?.data || res.data;
        setEmployees([newItem, ...employees]);
        setToastMessage(`🎉 Success! New Employee "${payload.firstName} ${payload.lastName}" has been added to MySQL database.`);
      }
      setIsModalOpen(false);
      fetchEmployees();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee details');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/employees/${deleteId}`);
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white font-bold text-lg px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workforce Employee Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage corporate staff records, job roles, departments, salaries, and security permissions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by code, name, email, department or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Management">Management</option>
              <option value="Finance">Finance</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations & Infrastructure">Operations & Infra</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Roles</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN (Admin)</option>
              <option value="ROLE_MANAGER">ROLE_MANAGER (Manager)</option>
              <option value="ROLE_HR">ROLE_HR (HR Lead)</option>
              <option value="ROLE_FINANCE">ROLE_FINANCE (Finance)</option>
              <option value="ROLE_EMPLOYEE">ROLE_EMPLOYEE (Employee)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="code-DESC">Sort: Code (DESC)</option>
              <option value="code-ASC">Sort: Code (ASC)</option>
              <option value="firstName-ASC">Sort: Letters / Name (A-Z)</option>
              <option value="firstName-DESC">Sort: Letters / Name (Z-A)</option>
              <option value="department-ASC">Sort: Department Name (A-Z)</option>
              <option value="department-DESC">Sort: Department Name (Z-A)</option>
              <option value="status-ASC">Sort: Status (A-Z)</option>
              <option value="salary-DESC">Sort: Salary (High-Low)</option>
            </select>
          </div>
        </div>

        {(search || department !== 'All' || role !== 'All' || status !== 'All' || sortBy !== 'code') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Directory Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading employee records...</div>
        ) : !Array.isArray(employees) || employees.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No employees found matching the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131e3b] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Emp Code</th>
                  <th className="py-3.5 px-4">Full Name & Email</th>
                  <th className="py-3.5 px-4">Department & Title</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Salary (Annual)</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {(Array.isArray(employees) ? employees : []).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-400">
                      {emp.code}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[11px] text-slate-400">{emp.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{emp.department}</div>
                      <div className="text-[11px] text-slate-400">{emp.jobTitle}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          emp.accountRole === 'ROLE_ADMIN'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : emp.accountRole === 'ROLE_MANAGER'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : emp.accountRole === 'ROLE_HR'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : emp.accountRole === 'ROLE_FINANCE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {emp.accountRole}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      ₹{emp.salary?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {emp.officeLocation || 'Bengaluru, India'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{emp.status || 'ACTIVE'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors cursor-pointer"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-[#131e3b] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="bg-[#0f172a] border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page (Total: {totalElements} records)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded font-medium transition-colors"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-200">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Employee */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmp ? `Edit Employee (${selectedEmp.code})` : 'Add New Workforce Employee'}
        subtitle="Specify personal, organizational, payroll, and account security details."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Management">Management</option>
                <option value="Finance">Finance</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations & Infrastructure">Operations & Infrastructure</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Sales">Sales</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Senior Architect"
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Security Role</label>
              <select
                value={formData.accountRole}
                onChange={(e) => setFormData({ ...formData, accountRole: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ROLE_EMPLOYEE">ROLE_EMPLOYEE (Employee)</option>
                <option value="ROLE_MANAGER">ROLE_MANAGER (Manager)</option>
                <option value="ROLE_HR">ROLE_HR (HR Lead)</option>
                <option value="ROLE_FINANCE">ROLE_FINANCE (Finance)</option>
                <option value="ROLE_ADMIN">ROLE_ADMIN (System Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Annual Salary (₹ INR)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Office Location</label>
              <input
                type="text"
                value={formData.officeLocation}
                onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Skills (comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Employment Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
            >
              {selectedEmp ? 'Save Changes' : 'Create Employee Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          title="Confirm Employee Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Are you sure you want to remove this employee record? This action cannot be undone.</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
