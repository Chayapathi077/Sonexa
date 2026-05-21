export interface ReportTemplate {
  id: string;
  userId: string;
  category: string;
  name: string;
  content: string;
  createdAt: number;
}

export const getTemplates = async (userId: string): Promise<ReportTemplate[]> => {
  try {
    const res = await fetch(`/api/users/${userId}/templates`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch templates", error);
    return [];
  }
};

export const saveTemplate = async (template: ReportTemplate) => {
  const res = await fetch(`/api/users/${template.userId}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!res.ok) throw new Error('Failed to save template');
};

export const deleteTemplate = async (id: string, userId: string) => {
  const res = await fetch(`/api/users/${userId}/templates/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete template');
};

export interface FetalReport {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  referredBy: string;
  visitNo: string;
  visitDate: string;
  lmpDate: string;
  lmpEdd: string;
  details: string;
}

export interface UserProfile {
  photoURL?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
};

export const getReports = async (userId: string): Promise<FetalReport[]> => {
  try {
    const res = await fetch(`/api/users/${userId}/reports`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch reports", error);
    return [];
  }
};

export const saveReport = async (report: FetalReport) => {
  const res = await fetch(`/api/users/${report.userId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error('Failed to save report');
};

export const getReport = async (id: string, userId: string): Promise<FetalReport | undefined> => {
  try {
    const res = await fetch(`/api/users/${userId}/reports/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch report", error);
    return undefined;
  }
};

export const deleteReport = async (id: string, userId: string) => {
  const res = await fetch(`/api/users/${userId}/reports/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete report');
};

export const deleteUserData = async (userId: string) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete user data');
};


