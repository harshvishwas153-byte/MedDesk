import React, { useState } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  Activity,
  X,
  CheckCircle,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { User, Appointment, ViewMode } from '../../types';
import { MedicareApiClient } from '../../services/api';

interface AdminDashboardProps {
  onNavigate: (view: ViewMode) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
}) => {
  const [users, setUsers] = useState<User[]>(MedicareApiClient.getUsers());
  const [appointments, setAppointments] = useState<Appointment[]>(
    MedicareApiClient.getAppointments()
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chartRange, setChartRange] = useState<'This Week' | 'Last Week' | 'This Month'>(
    'This Week'
  );
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [mobileTab, setMobileTab] = useState<'users' | 'metrics' | 'analytics'>('users');

  // Dynamic weekly chart data based on actual appointments in database
  const getWeeklyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    appointments.forEach((apt) => {
      const dateObj = new Date(apt.date);
      if (!isNaN(dateObj.getTime())) {
        const dayName = days[dateObj.getDay()] as keyof typeof dayCounts;
        if (dayCounts[dayName] !== undefined) {
          dayCounts[dayName] += 1;
        }
      } else {
        dayCounts['Mon'] += 1;
      }
    });

    const maxVal = Math.max(...Object.values(dayCounts), 5);

    return Object.entries(dayCounts).map(([day, count]) => {
      const heightPercent = Math.min(100, Math.round((count / maxVal) * 90)) + 5;
      return {
        day,
        count,
        height: `${heightPercent}%`,
      };
    });
  };

  const chartDataWeekly = getWeeklyChartData();
  const totalWeeklyAppointments = appointments.length;

  const totalUsersCount = users.length;
  const totalDoctorsCount = users.filter((u) => u.role === 'DOCTOR').length;
  const totalAppointmentsCount = appointments.length;
  const activeTodayCount = users.filter((u) => u.status === 'Active').length;

  const handleToggleStatus = (userId: string) => {
    const updated = MedicareApiClient.toggleUserStatus(userId);
    setUsers(updated);
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({
        ...selectedUser,
        status: selectedUser.status === 'Active' ? 'Inactive' : 'Active',
      });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
    };

    const currentUsers = MedicareApiClient.getUsers();
    const updated = [newUser, ...currentUsers];
    localStorage.setItem('medicare_users_v1', JSON.stringify(updated));
    setUsers(updated);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Tab Segmented Switcher */}
      <div className="md:hidden flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
        <button
          onClick={() => setMobileTab('users')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'users'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setMobileTab('metrics')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'metrics'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setMobileTab('analytics')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* 1. Stat Cards Row: Compact 2x2 on mobile, 4-col on desktop */}
      <div className={`${mobileTab === 'metrics' ? 'grid' : 'hidden md:grid'} grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-5`}>
        {/* Total Users */}
        <div
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">Total Users</span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{totalUsersCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Doctors */}
        <div
          onClick={() => onNavigate('admin-doctors')}
          className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">Doctors</span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{totalDoctorsCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Total Appointments */}
        <div
          onClick={() => onNavigate('admin-appointments')}
          className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">
              Appointments
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{totalAppointmentsCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Active Today */}
        <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block mb-0.5 sm:mb-1 truncate">Active Today</span>
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">{activeTodayCount}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Recent Users & Appointments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Recent Users Table matching Screenshot 4 */}
        <div
          className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between ${
            mobileTab === 'users' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-100 sm:border-b-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Users</h3>
                <p className="text-[11px] text-slate-400">Patients & Clinicians registered</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            {/* Mobile Fluid Cards: No Horizontal Scrolling */}
            <div className="sm:hidden divide-y divide-slate-100">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 truncate">{user.email}</p>
                      <span className="text-[10px] text-slate-400">
                        {user.role === 'PATIENT' ? 'Patient' : user.role === 'DOCTOR' ? 'Doctor' : 'Admin'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {user.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-xs"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {user.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.role === 'PATIENT' ? 'Patient' : user.role === 'DOCTOR' ? 'Doctor' : 'Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top {Math.min(5, users.length)} of {users.length} active records</span>
            <button
              onClick={() => onNavigate('admin-users')}
              className="text-rose-600 font-semibold hover:underline"
            >
              Manage all users →
            </button>
          </div>
        </div>

        {/* Right Column: Appointments Overview Bar Chart matching Screenshot 4 */}
        <div
          className={`lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between ${
            mobileTab === 'analytics' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Appointments Overview</h3>
              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value as any)}
                aria-label="Filter appointments by time period"
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer focus:border-rose-400"
              >
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* Custom Bar Chart Canvas matching Screenshot 4 */}
            <div className="relative h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-200">
              {/* Y-axis guidelines */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between text-[10px] text-slate-400 border-b border-dashed border-slate-100">
                <span>40</span>
              </div>
              <div className="absolute inset-x-0 top-1/4 flex items-center justify-between text-[10px] text-slate-400 border-b border-dashed border-slate-100">
                <span>30</span>
              </div>
              <div className="absolute inset-x-0 top-2/4 flex items-center justify-between text-[10px] text-slate-400 border-b border-dashed border-slate-100">
                <span>20</span>
              </div>
              <div className="absolute inset-x-0 top-3/4 flex items-center justify-between text-[10px] text-slate-400 border-b border-dashed border-slate-100">
                <span>10</span>
              </div>
              <div className="absolute inset-x-0 bottom-2 text-[10px] text-slate-400">
                <span>0</span>
              </div>

              {/* Bars */}
              {chartDataWeekly.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative z-10"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none transition-opacity">
                    {item.count} bookings
                  </div>

                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[28px] bg-rose-500 group-hover:bg-rose-600 rounded-t-md transition-all"
                  ></div>
                  <span className="text-[11px] font-medium text-slate-500 mt-2 block">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              Confirmed Appointments
            </span>
            <span className="font-bold text-slate-900 tabular-nums">{totalWeeklyAppointments} total this week</span>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">User Record Details</h4>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-base text-slate-900">{selectedUser.name}</h5>
                  <p className="text-xs text-rose-600 font-semibold">{selectedUser.role}</p>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Account ID</span>
                  <span className="font-mono text-slate-700">{selectedUser.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">System Status</span>
                  <span
                    className={`font-semibold ${
                      selectedUser.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                  <span className="text-slate-700">{selectedUser.phone || '+91 98765 00000'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Database Source</span>
                  <span className="font-mono text-rose-600">JPA / PostgreSQL</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    selectedUser.status === 'Active'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedUser.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Add New User to MedDesk</h4>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-400"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
