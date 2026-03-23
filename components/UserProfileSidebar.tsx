"use client";

import { useRouter } from "next/navigation";
import { useSnapChefAuth } from "./auth/AuthProvider";

interface UserProfileSidebarProps {
  isGuest?: boolean;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

export default function UserProfileSidebar({ isGuest = false, isLoading = false, onEditProfile }: UserProfileSidebarProps) {
  const router = useRouter();
  const { clerkUser, preferences } = useSnapChefAuth();

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
      return;
    }

    router.push("/profile");
  };

  const hasProfileData = Boolean(
    preferences && (
      preferences.age > 0 ||
      preferences.allergies.length > 0 ||
      preferences.religious.length > 0 ||
      preferences.medical.trim().length > 0
    ),
  );

  return (
    <div style={{
      width: '100%',
      maxWidth: '320px',
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      height: 'fit-content',
      position: 'sticky',
      top: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          Dietary Profile
        </h3>
      </div>

      {/* Clerk user badge */}
      {clerkUser && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: '#f0fdf4',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid #bbf7d0'
        }}>
          {clerkUser.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clerkUser.imageUrl} alt="" width={28} height={28} style={{ borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                {(clerkUser.fullName ?? clerkUser.email ?? '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {clerkUser.fullName ?? clerkUser.email}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>Signed in</div>
          </div>
        </div>
      )}

      {isGuest && !clerkUser && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: '#fffbeb',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700 }}>
            G
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e' }}>Guest mode</div>
            <div style={{ fontSize: '0.72rem', color: '#b45309' }}>Recipes stay temporary until you sign in.</div>
          </div>
        </div>
      )}

      {/* Profile Content */}
      {isLoading ? (
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading preferences...</div>
      ) : hasProfileData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Age */}
          {preferences && preferences.age > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                Age
              </div>
              <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                {preferences.age} years old
              </div>
            </div>
          )}

          {/* Allergies */}
          {preferences && preferences.allergies.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                Allergies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {preferences.allergies.map((allergy, index) => (
                  <span
                    key={`${allergy}-${index}`}
                    style={{
                      fontSize: '0.75rem',
                      background: '#fee2e2',
                      color: '#991b1b',
                      padding: '4px 8px',
                      borderRadius: '999px'
                    }}
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Religious Restrictions */}
          {preferences && preferences.religious.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                Religious Restrictions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {preferences.religious.map((restriction, index) => (
                  <span
                    key={`${restriction}-${index}`}
                    style={{
                      fontSize: '0.75rem',
                      background: '#dbeafe',
                      color: '#1e3a8a',
                      padding: '4px 8px',
                      borderRadius: '999px'
                    }}
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Restrictions */}
          {preferences && preferences.medical.trim().length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                Medical Restrictions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 8px',
                    borderRadius: '999px'
                  }}
                >
                  {preferences.medical}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 16px 0' }}>
            No dietary preferences set yet
          </p>
        </div>
      )}

      {/* Edit Button */}
      <button
        onClick={handleEditProfile}
        style={{
          width: '100%',
          background: '#f3f4f6',
          color: '#374151',
          fontSize: '0.9rem',
          fontWeight: '600',
          padding: '12px 16px',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        {clerkUser ? 'Edit Profile' : isGuest ? 'Edit Session Preferences' : 'Edit Preferences'}
      </button>
    </div>
  );
}