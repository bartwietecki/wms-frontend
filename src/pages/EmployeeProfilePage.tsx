import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getProfile, updateProfile } from "../api/employee/profileApi";
import type { EmployeeProfile } from "../api/employee/types";
import { formatEmploymentType } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => setError(parseApiError(err, "Failed to load profile")))
      .finally(() => setLoading(false));
  }, []);

  function handleEdit() {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setFormError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setFormError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setFormError("First name and last name are required.");
      return;
    }

    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(parseApiError(err, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  }

  const headerAction = !isEditing && profile ? (
    <button className="btn-secondary" onClick={handleEdit}>
      Edit Profile
    </button>
  ) : undefined;

  return (
    <div>
      <PageHeader
        area="employee"
        title="My Profile"
        subtitle="View and update your personal information."
        action={headerAction}
      />

      {error && <div style={errorStyle}>{error}</div>}
      {saveSuccess && !isEditing && (
        <div style={successStyle}>Profile updated successfully.</div>
      )}

      {loading ? (
        <div style={loadingStyle}>Loading…</div>
      ) : profile ? (
        isEditing ? (
          <EditForm
            firstName={firstName}
            lastName={lastName}
            profile={profile}
            saving={saving}
            formError={formError}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <ProfileView profile={profile} />
        )
      ) : null}
    </div>
  );
}

// ProfileView

function ProfileView({ profile }: { profile: EmployeeProfile }) {
  return (
    <Card style={cardMaxWidth}>
      <SectionLabel>Personal Information</SectionLabel>
      <Field label="First Name" value={profile.firstName} />
      <Field label="Last Name" value={profile.lastName} />
      <Field label="Email" value={profile.email} />

      <SectionLabel style={{ marginTop: "var(--space-6)" }}>Work Details</SectionLabel>
      <Field label="Department" value={profile.departmentName} />
      <Field label="Position" value={profile.positionName} />
      <Field label="Employment Type" value={formatEmploymentType(profile.employmentType)} />
      <Field
        label="Status"
        value={
          <span style={profile.active ? activeStyle : inactiveStyle}>
            {profile.active ? "Active" : "Inactive"}
          </span>
        }
      />
    </Card>
  );
}

// EditForm

interface EditFormProps {
  firstName: string;
  lastName: string;
  profile: EmployeeProfile;
  saving: boolean;
  formError: string | null;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function EditForm({
  firstName, lastName,
  profile, saving, formError,
  onFirstNameChange, onLastNameChange,
  onSubmit, onCancel,
}: EditFormProps) {
  return (
    <Card style={cardMaxWidth}>
      <form onSubmit={onSubmit} noValidate>
        <SectionLabel>Personal Information</SectionLabel>

        <div style={formFieldStyle}>
          <label style={formLabelStyle} htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            className="form-input"
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            disabled={saving}
            autoFocus
          />
        </div>

        <div style={formFieldStyle}>
          <label style={formLabelStyle} htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            className="form-input"
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            disabled={saving}
          />
        </div>

        <Field label="Email" value={profile.email} />

        <SectionLabel style={{ marginTop: "var(--space-6)" }}>Work Details</SectionLabel>
        <Field label="Department" value={profile.departmentName} />
        <Field label="Position" value={profile.positionName} />
        <Field label="Employment Type" value={formatEmploymentType(profile.employmentType)} />
        <Field
          label="Status"
          value={
            <span style={profile.active ? activeStyle : inactiveStyle}>
              {profile.active ? "Active" : "Inactive"}
            </span>
          }
        />

        {formError && <div style={{ ...errorStyle, marginTop: "var(--space-5)" }}>{formError}</div>}

        <div style={formActionsStyle}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// Small helpers

function SectionLabel({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ ...sectionLabelStyle, ...style }}>{children}</div>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={fieldRowStyle}>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={fieldValueStyle}>{value}</div>
    </div>
  );
}

// Styles

const cardMaxWidth: CSSProperties = {
  maxWidth: 600,
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "var(--space-1)",
};

const fieldRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--space-4)",
  padding: "var(--space-3) 0",
  borderBottom: "1px solid var(--color-border)",
};

const fieldLabelStyle: CSSProperties = {
  width: 160,
  flexShrink: 0,
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

const fieldValueStyle: CSSProperties = {
  flex: 1,
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text)",
};

const activeStyle: CSSProperties = {
  color: "var(--color-success-text)",
  fontWeight: 600,
};

const inactiveStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontWeight: 600,
};

const formFieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
  marginBottom: "var(--space-4)",
};

const formLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

const formActionsStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-3)",
  justifyContent: "flex-end",
  marginTop: "var(--space-6)",
};

const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const successStyle: CSSProperties = {
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const loadingStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
};
