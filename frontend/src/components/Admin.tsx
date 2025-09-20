import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { companyAPI, authAPI } from '../services/api';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [addingUser, setAddingUser] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await companyAPI.getUsers();
      setUsers(response.data.results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddingUser(true);

    try {
      await authAPI.register({
        ...newUser,
        company: user!.company,
      });
      
      await fetchUsers();
      setShowAddUser(false);
      setNewUser({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error adding user. Please try again.');
    } finally {
      setAddingUser(false);
    }
  };

  // Check if user is admin
  if (!user?.is_company_admin && !user?.is_superuser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">Only company administrators can access this page.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Administration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage users for {user?.company_name}
            </p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add New User
          </button>
        </div>
      </Navbar>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Company Users</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {users.length} users in your company
                </p>
              </div>
              
              {users.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {users.map((companyUser) => (
                    <div key={companyUser.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                          <span className="text-primary-600 font-medium text-sm">
                            {(companyUser.first_name || companyUser.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {companyUser.first_name && companyUser.last_name
                              ? `${companyUser.first_name} ${companyUser.last_name}`
                              : companyUser.username}
                          </h3>
                          <p className="text-sm text-gray-500">@{companyUser.username}</p>
                          <p className="text-sm text-gray-500">{companyUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {companyUser.is_company_admin && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                        {companyUser.id === user?.id && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Joined {new Date(companyUser.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No users found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password_confirm}
                    onChange={(e) => setNewUser({ ...newUser, password_confirm: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {addingUser ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;