import { ScrapRequest } from '../types';

interface ScrapRequestsTableProps {
  requests: ScrapRequest[];
  isUpdating: boolean;
  onUpdateStatus: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
}

const getUserLabel = (user: ScrapRequest['user']): string => {
  if (!user) {
    return 'Unknown';
  }

  if (typeof user === 'string') {
    return user;
  }

  return user.name || user.email || 'Unknown';
};

function ScrapRequestsTable({ requests, isUpdating, onUpdateStatus }: ScrapRequestsTableProps) {
  return (
    <section className="admin-table-card">
      <div className="admin-table-header">
        <h2>Scrap Requests</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={3} className="admin-empty-row">No scrap requests found.</td>
              </tr>
            ) : (
              requests.map((request) => {
                const normalizedStatus = (request.status || '').toLowerCase();
                const isPending = normalizedStatus === 'pending';
                const rowKey = request._id || request.id || `${getUserLabel(request.user)}-${request.createdAt || ''}`;

                return (
                  <tr key={rowKey}>
                    <td>{getUserLabel(request.user)}</td>
                    <td>
                      <span className={`admin-status-badge ${normalizedStatus || 'pending'}`}>
                        {normalizedStatus || 'pending'}
                      </span>
                    </td>
                    <td className="admin-action-cell">
                      <button
                        type="button"
                        className="admin-btn approve"
                        disabled={!isPending || isUpdating}
                        onClick={() => onUpdateStatus(request._id || request.id || '', 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="admin-btn reject"
                        disabled={!isPending || isUpdating}
                        onClick={() => onUpdateStatus(request._id || request.id || '', 'rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ScrapRequestsTable;
