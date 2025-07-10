'use client';
import { useState, useEffect } from 'react';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { doc, updateDoc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [createdAt, setCreatedAt] = useState(null); // ✅ fix
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();

            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.address || ''
            });

            setCreatedAt(userData.createdAt || null); // ✅ store createdAt
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser, db]);

  const formatMemberSinceDate = () => {
    try {
      if (!createdAt) return 'Unknown date';

      if (typeof createdAt?.toDate === 'function') {
        return createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (typeof createdAt === 'string') {
        const parsed = new Date(createdAt);
        if (!isNaN(parsed)) {
          return parsed.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }

      return 'Unknown date';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown date';
    }
  };

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          updatedAt: new Date().toISOString()
        });

        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const fields = [
    { icon: FiUser, label: 'Name', key: 'name' },
    { icon: FiMail, label: 'Email', key: 'email', readOnly: true },
    { icon: FiPhone, label: 'Phone', key: 'phone' },
    { icon: FiMapPin, label: 'Address', key: 'address' }
  ];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {formData.name?.charAt(0) || 'U'}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold">{formData.name}</h3>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <FiCalendar className="mr-1" size={14} />
            Member since {formatMemberSinceDate()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex items-start p-3 border-b border-gray-100">
            <field.icon className="text-gray-500 mt-1 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">{field.label}</p>
              {isEditing && !field.readOnly ? (
                <input
                  type={field.key === 'phone' ? 'tel' : 'text'}
                  value={formData[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 mt-1 text-sm"
                />
              ) : (
                <p className={field.readOnly ? 'text-gray-400' : ''}>
                  {formData[field.key] || 'Not provided'}
                </p>
              )}
            </div>
            {!field.readOnly && (
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                {isEditing ? 'Save' : <FiEdit2 />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
