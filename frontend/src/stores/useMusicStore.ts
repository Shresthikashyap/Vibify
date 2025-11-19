import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	isFeaturedLoading: boolean;
	isMadeForYouLoading: boolean;
	isTrendingLoading: boolean;
	isNewReleasesLoading: boolean;
	isPopularLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	likedSongs: Song[];
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	newReleasesSongs: Song[];
	popularSongs: Song[];
	stats: Stats;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchNewReleasesSongs: () => Promise<void>;
	fetchPopularSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	fetchLikedSongs: () => Promise<void>;
	toggleLikeSong: (songId: string) => Promise<void>;
	isLikedSong: (songId: string) => boolean;
}

export const useMusicStore = create<MusicStore>((set,get) => ({
	albums: [],
	songs: [],
	isLoading: false,
	isFeaturedLoading: false,
	isMadeForYouLoading: false,
	isTrendingLoading: false,
	isNewReleasesLoading: false,
	isPopularLoading: false,
	error: null,
	currentAlbum: null,
	likedSongs: [],
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	newReleasesSongs: [],
	popularSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			console.log("Fetched songs:", response.data);
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			console.log("Fetched albums:", response.data);
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isFeaturedLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isFeaturedLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isMadeForYouLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isMadeForYouLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isTrendingLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isTrendingLoading: false });
		}
	},	
	fetchPopularSongs: async () => {
		set({ isPopularLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/popular");
			set({ popularSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isPopularLoading: false });
		}
	},	
	
	fetchNewReleasesSongs: async () => {
		set({ isNewReleasesLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/new-releases");
			set({ newReleasesSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isNewReleasesLoading: false });
		}
	},
	fetchLikedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/liked");
			set({ likedSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch liked songs" });
		} finally {
			set({ isLoading: false });
		}
	},

	toggleLikeSong: async (songId: string) => {
		try {
			const response = await axiosInstance.post(`/songs/like/${songId}`);
			const { isLiked } = response.data;

			// Update the liked songs list
			if (isLiked) {
				// Add to liked songs - fetch the full song details
				const song = get().songs.find(s => s._id === songId) 
					|| get().featuredSongs.find(s => s._id === songId)
					|| get().madeForYouSongs.find(s => s._id === songId)
					|| get().trendingSongs.find(s => s._id === songId);
				
				if (song) {
					set((state) => ({
						likedSongs: [...state.likedSongs, song]
					}));
				}
			} else {
				// Remove from liked songs
				set((state) => ({
					likedSongs: state.likedSongs.filter(song => song._id !== songId)
				}));
			}

			toast.success(isLiked ? "Added to liked songs" : "Removed from liked songs");
		} catch (error: any) {
			console.error("Error toggling like:", error);
			toast.error("Failed to update liked songs");
		}
	},

	isLikedSong: (songId: string) => {
		return get().likedSongs.some(song => song._id === songId);
	},
}));
