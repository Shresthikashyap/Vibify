import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
	isAuthenticated: boolean;
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;

	setAuthenticated: (authenticated: boolean) => void;
	checkAdminStatus: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAuthenticated: false,
	isAdmin: false,
	isLoading: false,
	error: null,

	setAuthenticated: (authenticated) => {
		set({ isAuthenticated: authenticated });
	},	

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false, error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isLoading: false, error: null });
	},
}));
