'use client';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function PasswordSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const validateForm = () => {
    const newErrors = {
      current: !currentPassword ? 'Current password is required' : '',
      new: !newPassword ? 'New password is required' : 
           newPassword.length < 6 ? 'Password must be at least 6 characters' : '',
      confirm: newPassword !== confirmPassword ? 'Passwords do not match' : ''
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      toast.success('Password updated successfully!', {
        icon: <FiCheck className="text-green-500" />
      });
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Password update error:', error);
      
      let errorMessage = 'Failed to update password';
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect';
          setErrors(prev => ({ ...prev, current: errorMessage }));
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please login again to change your password';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          setErrors(prev => ({ ...prev, new: errorMessage }));
          break;
      }
      
      toast.error(errorMessage, {
        icon: <FiX className="text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FiLock className="text-blue-600" />
          Change Password
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your account password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-2 border ${errors.current ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <FiEyeOff className="text-gray-400 hover:text-gray-500" />
              ) : (
                <FiEye className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {errors.current && (
            <p className="mt-1 text-sm text-red-600">{errors.current}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-2 border ${errors.new ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter new password (min 6 characters)"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <FiEyeOff className="text-gray-400 hover:text-gray-500" />
              ) : (
                <FiEye className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {errors.new && (
            <p className="mt-1 text-sm text-red-600">{errors.new}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-2 border ${errors.confirm ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FiEyeOff className="text-gray-400 hover:text-gray-500" />
              ) : (
                <FiEye className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {errors.confirm && (
            <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <FiLock className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}