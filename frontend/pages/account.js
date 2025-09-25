import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { FaPlane, FaUser, FaEnvelope, FaCalendarAlt, FaArrowLeft, FaEdit, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user, isAuthenticated, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    // TODO: Implement save functionality when backend supports profile updates
    setIsEditing(false);
    // For now, just exit editing mode
    console.log('Profile update would save:', formData);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      // TODO: Implement password change API call when backend supports it
      console.log('Password change would be implemented here');
      
      // Show message indicating feature is not yet implemented
      alert('Password change feature is not yet implemented.\n\nThis requires a backend API endpoint to securely update passwords in the database. Your current password remains unchanged.');
      
      // Reset form without actually changing anything
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>My Account - AI Travel Companion</title>
        <meta name="description" content="Manage your travel companion account" />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <FaPlane className="text-white text-xl flex-shrink-0" />
              <h1 className="text-xl font-bold text-white ml-2 hidden sm:block">AI Travel Companion</h1>
              <h1 className="text-lg font-bold text-white ml-2 sm:hidden">Travel</h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 min-w-0">
              <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base">
                <FaArrowLeft className="inline mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Link>
              <Link href="/itineraries" className="text-white/90 hover:text-white font-medium transition-colors text-sm sm:text-base">
                <span className="hidden sm:inline">My Adventures</span>
                <span className="sm:hidden">Adventures</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white font-medium transition-colors px-2 py-1 sm:px-3 rounded-md hover:bg-white/10 text-xs sm:text-sm md:text-base"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-4 mr-6">
                <FaUser className="text-blue-600 text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Account</h1>
                <p className="text-blue-100 mt-2">Manage your travel companion profile</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaUser className="text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.name || 'No name provided'}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-400 mr-3" />
                  <span className="text-gray-900">{user.email}</span>
                  <span className="ml-auto text-sm text-gray-500">(Cannot be changed)</span>
                </div>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                  </span>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Password & Security</h3>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors relative"
                  >
                    <FaLock className="mr-2" />
                    Change Password
                    <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Change Buttons */}
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handlePasswordChange}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={handleCancelPasswordChange}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaLock className="text-gray-400 mr-3" />
                  <span className="text-gray-900">••••••••••</span>
                  <span className="ml-auto text-sm text-gray-500">Password hidden for security</span>
                </div>
              )}
            </div>

            {/* Action Buttons for Editing */}
            {isEditing && (
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/itineraries"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-blue-600 text-2xl mb-4 group-hover:scale-110 transition-transform">
              ✈️
            </div>
            <h3 className="font-bold text-gray-900 mb-2">My Adventures</h3>
            <p className="text-gray-600 text-sm">View and manage your itineraries</p>
          </Link>

          <Link
            href="/reservations"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-green-600 text-2xl mb-4 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Reservations</h3>
            <p className="text-gray-600 text-sm">Manage your bookings</p>
          </Link>

          <Link
            href="/packing"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-purple-600 text-2xl mb-4 group-hover:scale-110 transition-transform">
              🧳
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Packing Lists</h3>
            <p className="text-gray-600 text-sm">Smart packing suggestions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}