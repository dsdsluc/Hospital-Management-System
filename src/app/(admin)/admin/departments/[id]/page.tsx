'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/shared/PageHeader';

interface HeadDoctor { id: string; name: string; specialization: string }
interface Member { id: string; name: string; specialization: string; status: 'ACTIVE'|'SUSPENDED'|'DEACTIVATED' }

interface DepartmentDetail {
  id: string;
  name: string;
  description: string | null;
  headDoctor: HeadDoctor | null;
  members: Member[];
  memberCount: number;
  appointmentCount: number;
  stats: {
    totalDoctors: number;
    activeDoctors: number;
    totalAppointments: number;
    upcomingAppointments: number;
    totalPatientsServed: number;
    headDoctor: HeadDoctor | null;
  };
}

export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departments/${params.id}`);
      if (res.ok) {
        const data: DepartmentDetail = await res.json();
        setDetail(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!detail) return <div className="p-6">Not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.name}
        description={detail.description ?? ''}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Doctors" value={detail.stats.totalDoctors} />
        <StatCard label="Active Doctors" value={detail.stats.activeDoctors} />
        <StatCard label="Total Appointments" value={detail.stats.totalAppointments} />
        <StatCard label="Upcoming Appointments" value={detail.stats.upcomingAppointments} />
        <StatCard label="Patients Served" value={detail.stats.totalPatientsServed} />
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Head Doctor</div>
          <div className="text-xl font-semibold">{detail.stats.headDoctor ? `${detail.stats.headDoctor.name}` : '-'}</div>
          <div className="text-gray-500">{detail.stats.headDoctor?.specialization ?? ''}</div>
        </div>
      </div>

      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b font-semibold">Doctors in Department</div>
        <ul>
          {detail.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-gray-500">{m.specialization}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${m.status==='ACTIVE'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{m.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

