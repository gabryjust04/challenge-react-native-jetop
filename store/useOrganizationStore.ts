import { create } from 'zustand';

type OrganizationStore = {
  currentOrgId: string | null;
  setOrgId: (id: string) => void;
  clearOrg: () => void;
};

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  currentOrgId: null,
  setOrgId: (id) => set({ currentOrgId: id }),
  clearOrg: () => set({ currentOrgId: null }),
}));
