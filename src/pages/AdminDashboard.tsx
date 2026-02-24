import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchScrapRequests, fetchUsers, updateScrapRequestStatus } from '../admin/adminApi';
import AdminSidebar from '../admin/components/AdminSidebar';
import MonthlyOrdersChart from '../admin/components/MonthlyOrdersChart';
import ScrapRequestsTable from '../admin/components/ScrapRequestsTable';
import SupportChatPanel from '../admin/components/SupportChatPanel';
import StatsCards from '../admin/components/StatsCards';
import UsersTable from '../admin/components/UsersTable';
import { AdminSection, AdminUser, ScrapRequest } from '../admin/types';
import '../styles/AdminDashboard.css';

function AdminDashboard() {

  // ✅ Proper role check (NEW FIX)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser?.role;

  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [rateCard, setRateCard] = useState<Record<string, number>>({
    plastic: 10,
    metal: 25,
    paper: 8,
    'e-waste': 15,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [usersData, requestsData] = await Promise.all([
          fetchUsers(),
          fetchScrapRequests(),
        ]);
        setUsers(usersData);
        setRequests(requestsData);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Unable to load admin data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAdminData();
  }, []);

  const totalScrapKg = useMemo(
    () =>
      requests.reduce((total, request) => {
        const weight = Number(request.estimatedWeightKg ?? request.weightKg ?? 0);
        return Number.isFinite(weight) ? total + weight : total;
      }, 0),
    [requests]
  );

  const totalRevenue = useMemo(
    () =>
      requests.reduce((total, request) => {
        const revenue = Number(request.estimatedPrice ?? request.totalPrice ?? request.price ?? 0);
        return Number.isFinite(revenue) ? total + revenue : total;
      }, 0),
    [requests]
  );

  const hasRevenueData = useMemo(
    () =>
      requests.some((request) =>
        request.estimatedPrice !== undefined ||
        request.totalPrice !== undefined ||
        request.price !== undefined
      ),
    [requests]
  );

  const approvedRequests = useMemo(
    () =>
      requests.filter(
        (request) => (request.status || '').toLowerCase() === 'approved'
      ).length,
    [requests]
  );

  const rejectedRequests = useMemo(
    () =>
      requests.filter(
        (request) => (request.status || '').toLowerCase() === 'rejected'
      ).length,
    [requests]
  );

  const completionRate = useMemo(() => {
    if (requests.length === 0) return 0;
    return Math.round((approvedRequests / requests.length) * 100);
  }, [approvedRequests, requests.length]);

  const handleStatusUpdate = async (
    requestId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> => {
    if (!requestId) return;

    setIsUpdating(true);
    setError('');

    try {
      const updated = await updateScrapRequestStatus(requestId, status);
      setRequests((previous) =>
        previous.map((item) =>
          item._id === updated._id ? updated : item
        )
      );
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update request status';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRateChange = (material: string, value: string) => {
    const numericValue = Number(value);
    setRateCard((previous) => ({
      ...previous,
      [material]:
        Number.isFinite(numericValue) && numericValue >= 0
          ? numericValue
          : 0,
    }));
  };

  const handleRateSave = () => {
    setError('');
    setNotice('Scrap rates updated in admin panel view.');
  };

  return (
    <div className="admin-page">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <section className="admin-content">
        <header className="admin-content-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users and monitor scrap requests from one place.</p>
        </header>

        {error && <div className="admin-alert">{error}</div>}
        {notice && <div className="admin-notice">{notice}</div>}

        {isLoading ? (
          <div className="admin-loading">Loading admin data...</div>
        ) : (
          <>
            {(activeSection === 'dashboard' ||
              activeSection === 'users' ||
              activeSection === 'requests' ||
              activeSection === 'support') && (
              <StatsCards
                totalUsers={users.length}
                totalOrders={requests.length}
                totalScrapKg={totalScrapKg}
                totalRevenue={totalRevenue}
                hasRevenueData={hasRevenueData}
              />
            )}

            {activeSection === 'dashboard' && (
              <div className="admin-panels-grid">
                <MonthlyOrdersChart />

                <UsersTable users={users.slice(0, 6)} />
                <ScrapRequestsTable
                  requests={requests.slice(0, 6)}
                  isUpdating={isUpdating}
                  onUpdateStatus={handleStatusUpdate}
                />

                <section className="admin-table-card">
                  <div className="admin-table-header">
                    <h2>Analytics Snapshot</h2>
                  </div>
                  <div className="admin-analytics-grid">
                    <article className="admin-analytics-item">
                      <p>Approved Requests</p>
                      <strong>{approvedRequests}</strong>
                    </article>
                    <article className="admin-analytics-item">
                      <p>Rejected Requests</p>
                      <strong>{rejectedRequests}</strong>
                    </article>
                    <article className="admin-analytics-item">
                      <p>Approval Rate</p>
                      <strong>{completionRate}%</strong>
                    </article>
                  </div>
                </section>

                <section className="admin-table-card">
                  <div className="admin-table-header">
                    <h2>Scrap Price Editor</h2>
                  </div>

                  <div className="admin-rate-grid">
                    {Object.entries(rateCard).map(([material, value]) => (
                      <label key={material} className="admin-rate-field">
                        <span>{material}</span>
                        <input
                          type="number"
                          min="0"
                          value={value}
                          onChange={(event) =>
                            handleRateChange(material, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="admin-rate-actions">
                    <button
                      type="button"
                      className="admin-btn approve"
                      onClick={handleRateSave}
                    >
                      Save Rates
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'users' && <UsersTable users={users} />}

            {activeSection === 'requests' && (
              <ScrapRequestsTable
                requests={requests}
                isUpdating={isUpdating}
                onUpdateStatus={handleStatusUpdate}
              />
            )}

            {activeSection === 'support' && <SupportChatPanel />}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
