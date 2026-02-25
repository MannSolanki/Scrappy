import { AdminUser } from '../types';

interface UsersTableProps {
  users: AdminUser[];
}

function UsersTable({ users }: UsersTableProps) {
  return (
    <section className="admin-table-card">
      <div className="admin-table-header">
        <h2>Users</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={2} className="admin-empty-row">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id || user.id || user.email}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-role-pill ${user.role === 'admin' ? 'admin' : 'user'}`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UsersTable;
