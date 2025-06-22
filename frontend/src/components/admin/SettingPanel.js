'use client';
import { FiLock, FiCreditCard, FiBell, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';

export default function SettingsPanel() {
  const settingsSections = [
    {
      title: 'Security',
      items: [
        {
          icon: FiLock,
          title: 'Change Password',
          description: 'Update your account password',
          href: '/admin/dashboard/settings/password'
        }
      ]
    },
    {
      title: 'Payments',
      items: [
        {
          icon: FiCreditCard,
          title: 'Payment Methods',
          description: 'Manage your saved payment options',
          href: '/admin/dashboard/settings/payments'
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: FiBell,
          title: 'Notifications',
          description: 'Configure notification settings',
          href: '/admin/dashboard/settings/notifications'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {settingsSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-lg font-medium mb-4">{section.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <item.icon className="mt-1 text-gray-500" size={20} />
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors flex items-center gap-2">
              <FiTrash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}