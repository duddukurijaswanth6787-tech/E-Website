import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Copy, Check } from 'lucide-react';
import { adminManagerService } from '../../../api/services/adminManager.service';
import type { ManagerAdmin } from '../../../api/services/adminManager.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  manager: ManagerAdmin;
}

const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
    const randomValues = new Uint32Array(8);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(randomValues[i] % chars.length);
    }
  return password;
};

const ResetManagerPasswordModal: React.FC<Props> = ({ isOpen, onClose, manager }) => {
  const [newPassword, setNewPassword] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = () => {
    setNewPassword(generateSecurePassword());
    setIsGenerated(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetMutation = useMutation({
    mutationFn: () => adminManagerService.resetManagerPassword(manager._id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminManagers'] });
      toast.success(`Password reset for ${manager.name}`);
      onClose();
    },
    onError: () => toast.error('Failed to reset password')
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-500">For {manager.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Generate a temporary password. The manager will be forced to change it on their next login.
            </p>

            <div className="mb-6">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Generate Secure Password
              </button>
            </div>

            {isGenerated && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100 relative">
                <p className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">Temporary Password</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl text-primary-900 font-bold tracking-wider">{newPassword}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-white rounded shadow-sm text-primary-600 hover:bg-primary-100 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resetMutation.mutate()}
                disabled={!isGenerated || resetMutation.isPending}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {resetMutation.isPending ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResetManagerPasswordModal;
