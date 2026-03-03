'use client';

import { useState } from 'react';
import { AppointmentStatus } from '@prisma/client';
import { Check, X, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  onUpdateStatus: (id: string, newStatus: string, version: number, reason?: string) => Promise<void>;
}

export function AppointmentStatusModal({ open, onClose, appointment, onUpdateStatus }: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open || !appointment) return null;

  const transitions: Record<string, string[]> = {
    'REQUESTED': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
    'CHECKED_IN': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': [],
    'NO_SHOW': [],
    'RESCHEDULED': ['CONFIRMED', 'CANCELLED']
  };

  const allowedStatuses = transitions[appointment.status] || [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    if (selectedStatus === 'CANCELLED' && !reason) {
      alert("Please provide a reason for cancellation");
      return; 
    }

    setSubmitting(true);
    try {
      await onUpdateStatus(appointment.id, selectedStatus, appointment.version, reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Update Status</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Current Status: <span className="font-medium text-gray-900">{appointment.status.replace('_', ' ')}</span></p>
          <p className="text-sm text-gray-500">Patient: <span className="font-medium text-gray-900">{appointment.patient.name}</span></p>
        </div>

        {allowedStatuses.length === 0 ? (
          <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-2 text-yellow-800 mb-4">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm">No further status transitions allowed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {allowedStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {selectedStatus === 'CANCELLED' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Please provide a reason..."
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedStatus || (selectedStatus === 'CANCELLED' && !reason)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
