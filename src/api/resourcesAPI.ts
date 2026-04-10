/**
 * Resources API Placeholder
 * * This file prepares the structure for fetching resources and notifications
 * from a Python backend server in the future.
 */

// 1. ADDED THE MISSING INTERFACE HERE
export interface UploadedResource {
  id: string | number;
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export const getUploadedResources = async (): Promise<UploadedResource[]> => {
  // Returns an empty array for now. You can connect this to your backend later!
  return []; 
};

export const deleteUploadedResource = async (id: string | number) => {
  console.log(`Resource ${id} deleted.`);
  return true;
};

export interface Notification {
  date: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface Resource {
  title: string;
  type: string;
  link: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  // TODO: Connect to Python backend
  // return await fetch(`${API_BASE_URL}/api/notifications`).then(res => res.json());
  return [];
}

export async function fetchResources(): Promise<Resource[]> {
  // TODO: Connect to Python backend
  // return await fetch(`${API_BASE_URL}/api/resources`).then(res => res.json());
  return [];
}