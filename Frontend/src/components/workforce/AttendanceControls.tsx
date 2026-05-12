import React, { useState } from 'react';
import { LogIn, LogOut, Coffee, Play, Pause, UserCheck, Monitor } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../api/services/attendance.service';
import { useWorkforceStatus } from '../../hooks/useWorkforceStatus';
import { type EmployeeLiveStatus } from '../../api/services/workforce.service';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const AttendanceControls: React.FC = () => {
  const queryClient = useQueryClient();
  const { updateStatus } = useWorkforceStatus(false);
  const [isPresent, setIsPresent] = useState(false); // This should ideally come from an initial check-in status check
  
  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      setIsPresent(true);
      toast.success('Check-in successful. Have a productive day!');
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-in failed')
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      setIsPresent(false);
      toast.success('Check-out successful. See you tomorrow!');
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-out failed')
  });

  const statusIcons: Record<EmployeeLiveStatus, any> = {
    online: <Monitor size={14} />,
    offline: <LogOut size={14} />,
    idle: <Pause size={14} />,
    working: <Play size={14} />,
    on_break: <Coffee size={14} />,
    busy: <Pause size={14} />,
    in_meeting: <UserCheck size={14} />
  };

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
      {!isPresent ? (
        <button 
          onClick={() => checkInMutation.mutate()}
          disabled={checkInMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
        >
          <LogIn size={14} /> Check In
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 border border-stone-800">
             {(['working', 'on_break', 'idle'] as EmployeeLiveStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={cn(
                    "p-2 rounded-lg transition-all hover:bg-stone-800",
                    "text-stone-400 hover:text-white"
                  )}
                  title={s.replace('_', ' ')}
                >
                  {statusIcons[s]}
                </button>
             ))}
          </div>
          <button 
            onClick={() => checkOutMutation.mutate()}
            disabled={checkOutMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
          >
            <LogOut size={14} /> Finish Day
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceControls;
