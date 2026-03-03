import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Appointment, AppointmentFilters, AppointmentListResponse, AppointmentStatus } from '@/types/appointments'
import type { DepartmentListItem } from '@/types/departments'
import type { DoctorListItem } from '@/lib/services/admin/doctors.client'
import { getAppointments, updateAppointmentStatus } from '@/lib/services/admin/appointments.client'
import { getDepartments } from '@/lib/services/admin/departments.client'
import { getDoctors } from '@/lib/services/admin/doctors.client'

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [departments, setDepartments] = useState<DepartmentListItem[]>([])
  const [doctors, setDoctorsList] = useState<DoctorListItem[]>([])
  const [pagination, setPagination] = useState<AppointmentListResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AppointmentFilters>({
    startDate: '',
    endDate: '',
    departmentId: '',
    status: '',
    doctorId: '',
    search: '',
    page: 1,
    limit: 20,
  })

  const fetchMeta = useCallback(async () => {
    const [depRes, docs] = await Promise.all([getDepartments(), getDoctors(100)])
    setDepartments(depRes.data)
    setDoctorsList(docs)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)) })
    const res = await getAppointments(params)
    setAppointments(res.data)
    setPagination(res.pagination)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchMeta() }, [fetchMeta])
  useEffect(() => { fetchData() }, [fetchData])

  const onStatusChange = useCallback(async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(id, status)
    fetchData()
  }, [fetchData])

  const summary = useMemo(() => ({
    total: pagination?.total ?? 0,
    upcoming: appointments.filter(a => a.status === 'BOOKED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  }), [appointments, pagination])

  return { appointments, departments, doctors, pagination, loading, filters, setFilters, onStatusChange, summary }
}
