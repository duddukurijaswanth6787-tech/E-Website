import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Shield, CheckCircle, AlertTriangle, TrendingUp, User } from 'lucide-react';
import type { ManagerAdmin } from '../../../api/services/adminManager.service';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  manager: ManagerAdmin;
}

const ManagerDetailsDrawer: React.FC<Props> = ({ isOpen, onClose, manager }) => {
  if (!isOpen) return null;

  const totalAssignments = (manager.activeAssignmentsCount || 0) + (manager.completedAssignmentsCount || 0) + (manager.delayedAssignmentsCount || 0);
  const completionRate = totalAssignments > 0 ? Math.round((manager.completedAssignmentsCount / totalAssignments) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        
        <div className="absolute inset-y-0 right-0 max-w-full flex">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-lg bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                  {manager.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{manager.name}</h2>
                  <p className="text-sm text-gray-500 font-medium">{manager.managerCode} • {manager.managerType}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle size={18} className="text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">{manager.completedAssignmentsCount || 0}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase">Delayed</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">{manager.delayedAssignmentsCount || 0}</p>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                    <TrendingUp size={16} className="mr-2 text-blue-600" /> Operational Efficiency
                  </h3>
                  <span className="text-lg font-bold text-blue-600">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${completionRate}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 font-medium">
                  Based on {totalAssignments} total assigned workflows across {manager.branchName || 'assigned workshops'}.
                </p>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" /> Recent Activity Timeline
                </h3>
                <div className="space-y-4 border-l-2 border-gray-100 ml-2 pl-6 py-2">
                  {manager.lastLoginAt ? (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                      <p className="text-sm font-bold text-gray-900">Last Successful Login</p>
                      <p className="text-xs text-gray-500">{format(new Date(manager.lastLoginAt), 'MMM dd, yyyy • hh:mm a')}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No login history recorded.</p>
                  )}
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white" />
                    <p className="text-sm font-bold text-gray-900">Account Initialized</p>
                    <p className="text-xs text-gray-500">{format(new Date(manager.createdAt), 'MMM dd, yyyy • hh:mm a')}</p>
                  </div>
                </div>
              </div>

              {/* Security & Governance */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                  <Shield size={16} className="mr-2 text-gray-400" /> Security Audit
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Account Status</span>
                    <span className={`font-bold ${manager.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {manager.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Verification</span>
                    <span className="font-bold text-gray-900">{manager.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Force Password Change</span>
                    <span className={`font-bold ${manager.mustChangePassword ? 'text-amber-600' : 'text-gray-400'}`}>
                      {manager.mustChangePassword ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center text-xs text-gray-400">
                <User size={12} className="mr-1" />
                <span>System UID: {manager._id}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ManagerDetailsDrawer;
