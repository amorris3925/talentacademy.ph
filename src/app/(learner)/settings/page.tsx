'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Bell,
  Compass,
  Sparkles,
  Shield,
  Save,
  Download,
  Trash2,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settings';
import {
  Button,
  Input,
  Select,
  Toggle,
  FileUpload,
  Modal,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { AcademyLearner, LearnerSettings } from '@/types';

export default function SettingsPage() {
  const { profile, settings, isSaving, saveStatus, loadSettings } =
    useSettingsStore();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings()
      .then(() => setLoaded(true))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        setLoaded(true);
      });
  }, [loadSettings]);

  if (!loaded) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mb-8 text-sm text-gray-500">
        Manage your profile, notifications, and preferences.
      </p>

      {/* Save status banner */}
      {saveStatus === 'saved' && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Changes saved successfully.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          Failed to save changes. Please try again.
        </div>
      )}

      <div className="space-y-8">
        <ProfileSection profile={profile} isSaving={isSaving} />
        <NotificationPreferencesSection settings={settings} isSaving={isSaving} />
        <TrackPreferencesSection settings={settings} isSaving={isSaving} />
        <AIPreferencesSection settings={settings} isSaving={isSaving} />
        <AccountManagementSection />
      </div>
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function SectionWrapper({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

// ─── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection({
  profile,
  isSaving,
}: {
  profile: Partial<AcademyLearner>;
  isSaving: boolean;
}) {
  const { updateProfile, uploadCv } = useSettingsStore();

  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [sex, setSex] = useState(profile.sex || '');
  const [maritalStatus, setMaritalStatus] = useState(profile.marital_status || '');

  const handleSave = async () => {
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      website_url: websiteUrl || null,
      age: age ? parseInt(age, 10) : null,
      sex: sex || null,
      marital_status: maritalStatus || null,
    } as Partial<AcademyLearner>);
  };

  return (
    <SectionWrapper
      icon={User}
      title="Profile"
      description="Your personal information."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          label="Email"
          value={profile.email || ''}
          disabled
          helperText="Email cannot be changed."
        />

        <Input
          label="Website URL"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
        />

        <FileUpload
          label="CV / Resume"
          accept=".pdf,.doc,.docx"
          maxSize={10 * 1024 * 1024}
          onUpload={uploadCv}
          currentFile={profile.cv_url || undefined}
          isUploading={isSaving}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
          />
          <Select
            label="Sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            placeholder="Select"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
          />
          <Select
            label="Marital Status"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            placeholder="Select"
            options={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

// ─── Notification Preferences ────────────────────────────────────────────────

function NotificationPreferencesSection({
  settings,
  isSaving,
}: {
  settings: LearnerSettings | null;
  isSaving: boolean;
}) {
  const { updateSettings } = useSettingsStore();

  if (!settings) return null;

  const toggles: {
    key: keyof LearnerSettings;
    label: string;
    description: string;
  }[] = [
    {
      key: 'notification_lesson_reminders',
      label: 'Lesson Reminders',
      description: 'Get reminders to continue your lessons.',
    },
    {
      key: 'notification_streak_alerts',
      label: 'Streak Alerts',
      description: 'Be notified when your streak is about to break.',
    },
    {
      key: 'notification_peer_review',
      label: 'Peer Review',
      description: 'Notifications when someone reviews your work.',
    },
    {
      key: 'notification_team_challenges',
      label: 'Team Challenges',
      description: 'Updates on team challenges and competitions.',
    },
    {
      key: 'notification_badges',
      label: 'Badge Earned',
      description: 'Celebrate when you earn a new badge.',
    },
  ];

  return (
    <SectionWrapper
      icon={Bell}
      title="Notifications"
      description="Choose what notifications you receive."
    >
      <div className="space-y-5">
        {toggles.map((toggle) => (
          <Toggle
            key={toggle.key}
            label={toggle.label}
            description={toggle.description}
            checked={settings[toggle.key] as boolean}
            disabled={isSaving}
            onChange={(checked) =>
              updateSettings({ [toggle.key]: checked } as Partial<LearnerSettings>)
            }
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── Track Preferences ───────────────────────────────────────────────────────

function TrackPreferencesSection({
  settings,
  isSaving,
}: {
  settings: LearnerSettings | null;
  isSaving: boolean;
}) {
  const { updateSettings } = useSettingsStore();

  if (!settings) return null;

  return (
    <SectionWrapper
      icon={Compass}
      title="Track Preferences"
      description="Set your default learning track."
    >
      <Select
        label="Preferred Track"
        value={settings.preferred_track || ''}
        onChange={(e) =>
          updateSettings({ preferred_track: e.target.value || null })
        }
        placeholder="No preference"
        options={[
          { value: 'leadership', label: 'Leadership' },
          { value: 'management', label: 'Management' },
          { value: 'talent', label: 'Talent Development' },
          { value: 'innovation', label: 'Innovation' },
          { value: 'communications', label: 'Communications' },
        ]}
        disabled={isSaving}
      />
    </SectionWrapper>
  );
}

// ─── AI Preferences ──────────────────────────────────────────────────────────

function AIPreferencesSection({
  settings,
  isSaving,
}: {
  settings: LearnerSettings | null;
  isSaving: boolean;
}) {
  const { updateSettings } = useSettingsStore();

  if (!settings) return null;

  return (
    <SectionWrapper
      icon={Sparkles}
      title="AI Preferences"
      description="Customize default AI generation settings."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Default Image Style"
          value={settings.ai_default_image_style || ''}
          onChange={(e) =>
            updateSettings({ ai_default_image_style: e.target.value || null })
          }
          placeholder="No preference"
          options={[
            { value: 'realistic', label: 'Realistic' },
            { value: 'anime', label: 'Anime' },
            { value: '3d', label: '3D' },
            { value: 'pixel', label: 'Pixel Art' },
            { value: 'watercolor', label: 'Watercolor' },
          ]}
          disabled={isSaving}
        />
        <Select
          label="Default Voice"
          value={settings.ai_default_voice || ''}
          onChange={(e) =>
            updateSettings({ ai_default_voice: e.target.value || null })
          }
          placeholder="No preference"
          options={[
            { value: 'alloy', label: 'Alloy' },
            { value: 'echo', label: 'Echo' },
            { value: 'fable', label: 'Fable' },
            { value: 'onyx', label: 'Onyx' },
            { value: 'nova', label: 'Nova' },
            { value: 'shimmer', label: 'Shimmer' },
          ]}
          disabled={isSaving}
        />
        <Select
          label="Default Video Style"
          value={settings.ai_default_video_style || ''}
          onChange={(e) =>
            updateSettings({ ai_default_video_style: e.target.value || null })
          }
          placeholder="No preference"
          options={[
            { value: 'cinematic', label: 'Cinematic' },
            { value: 'animation', label: 'Animation' },
            { value: 'documentary', label: 'Documentary' },
          ]}
          disabled={isSaving}
        />
        <Select
          label="Default Music Genre"
          value={settings.ai_default_music_genre || ''}
          onChange={(e) =>
            updateSettings({ ai_default_music_genre: e.target.value || null })
          }
          placeholder="No preference"
          options={[
            { value: 'ambient', label: 'Ambient' },
            { value: 'pop', label: 'Pop' },
            { value: 'rock', label: 'Rock' },
            { value: 'electronic', label: 'Electronic' },
            { value: 'classical', label: 'Classical' },
          ]}
          disabled={isSaving}
        />
      </div>
    </SectionWrapper>
  );
}

// ─── Account Management ──────────────────────────────────────────────────────

function AccountManagementSection() {
  const { changePassword, deleteAccount, isSaving } = useSettingsStore();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    try {
      await changePassword(newPassword);
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteError(null);
    try {
      await deleteAccount();
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete account. Please try again.',
      );
    }
  };

  const handleExportData = () => {
    // Export endpoint not implemented yet
  };

  return (
    <>
      <SectionWrapper
        icon={Shield}
        title="Account"
        description="Manage your account security and data."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowPasswordModal(true)}
          >
            <Key className="h-4 w-4" />
            Change Password
          </Button>
          <Button variant="outline" size="md" onClick={handleExportData} disabled>
            <Download className="h-4 w-4" />
            Export My Data (Coming Soon)
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </SectionWrapper>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError(null);
        }}
        title="Change Password"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 8 characters."
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleChangePassword}
              isLoading={isSaving}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                This action is irreversible
              </p>
              <p className="mt-1 text-sm text-red-700">
                All your progress, badges, certificates, and data will be
                permanently deleted.
              </p>
            </div>
          </div>

          <Input
            label='Type "DELETE" to confirm'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
          />

          {deleteError && (
            <p className="text-sm text-red-600">{deleteError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              isLoading={isSaving}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
