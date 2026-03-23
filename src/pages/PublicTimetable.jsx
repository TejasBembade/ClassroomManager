import { useEffect, useState } from 'react';
import { getPublicDepartments, getPublicTimetable } from '../api/index';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ALL_BRANCHES = 'all';

export default function PublicTimetable({ onBack }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(ALL_BRANCHES);
  const [assignments, setAssignments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicDepartments()
      .then((res) => setDepartments(res.data))
      .catch((err) => {
        const status = err.response?.status;
        if (status === 404) {
          setError('Public branch-wise timetable is not available yet. Redeploy the backend to enable this view.');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load branches');
      })
      .finally(() => setLoadingDepartments(false));
  }, []);

  useEffect(() => {
    setLoadingTimetable(true);
    getPublicTimetable(selectedDepartmentId === ALL_BRANCHES ? undefined : selectedDepartmentId)
      .then((res) => setAssignments(res.data))
      .catch((err) => {
        const status = err.response?.status;
        if (status === 404) {
          setError('Public branch-wise timetable is not available yet. Redeploy the backend to enable this view.');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load timetable');
      })
      .finally(() => setLoadingTimetable(false));
  }, [selectedDepartmentId]);

  const activeDepartment = departments.find((department) => department._id === selectedDepartmentId);
  const isLoading = loadingDepartments || loadingTimetable;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-[36px] px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="section-kicker">Public View</p>
            <h1 className="display-font text-4xl text-slate-900 sm:text-5xl">
              {activeDepartment ? `${activeDepartment.name} Timetable` : 'Branch-wise Timetable'}
            </h1>
          </div>

          <button onClick={onBack} className="secondary-button w-fit">
            Back to Login
          </button>
        </div>

        {!error && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDepartmentId(ALL_BRANCHES)}
              className={`tab-button ${selectedDepartmentId === ALL_BRANCHES ? 'tab-button-active' : ''}`}
            >
              All Branches
            </button>
            {departments.map((department) => (
              <button
                key={department._id}
                onClick={() => setSelectedDepartmentId(department._id)}
                className={`tab-button ${selectedDepartmentId === department._id ? 'tab-button-active' : ''}`}
              >
                {department.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="glass-panel rounded-[30px] px-6 py-10 text-center text-sm text-slate-500">
            Loading timetable...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <section className="glass-panel rounded-[30px] p-6">
            {DAYS.map((day) => {
              const dayAssignments = assignments.filter((a) => a.day === day);
              if (dayAssignments.length === 0) return null;

              return (
                <div key={day} className="mb-8 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="display-font text-2xl text-slate-900">{day}</h2>
                    <span className="info-pill">{dayAssignments.length} classes</span>
                  </div>

                  <div className="table-shell overflow-x-auto">
                    <table className="data-table min-w-[820px]">
                      <thead>
                        <tr>
                          {selectedDepartmentId === ALL_BRANCHES && <th>Branch</th>}
                          <th>Room</th>
                          <th>Subject</th>
                          <th>Teacher</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayAssignments.map((a) => (
                          <tr key={a._id}>
                            {selectedDepartmentId === ALL_BRANCHES && (
                              <td>{a.subjectId?.departmentId?.name || '-'}</td>
                            )}
                            <td className="font-semibold text-slate-800">{a.roomId?.roomNumber}</td>
                            <td>{a.subjectId?.name}</td>
                            <td>{a.teacherName}</td>
                            <td>{a.timeSlotId?.startTime} - {a.timeSlotId?.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {assignments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-400">
                No timetable is available for the selected branch yet.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
