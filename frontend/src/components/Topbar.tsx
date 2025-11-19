import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Home, Search, Music, Disc } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Topbar = () => {
	const navigate = useNavigate();
	const { isAdmin } = useAuthStore();
	const { featuredSongs, madeForYouSongs, trendingSongs, albums } = useMusicStore();
	const { setCurrentSong } = usePlayerStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Filter songs and albums based on search query
	const filteredSongs = searchQuery.trim()
		? [
				...featuredSongs.filter(
					(song) =>
						song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						song.artist.toLowerCase().includes(searchQuery.toLowerCase())
				),
				...madeForYouSongs.filter(
					(song) =>
						song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						song.artist.toLowerCase().includes(searchQuery.toLowerCase())
				),
				...trendingSongs.filter(
					(song) =>
						song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						song.artist.toLowerCase().includes(searchQuery.toLowerCase())
				),
		  ].filter((song, index, self) => 
				// Remove duplicates based on song._id
				index === self.findIndex((s) => s._id === song._id)
		  )
		: [];

	const filteredAlbums = searchQuery.trim()
		? albums.filter((album) =>
				album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				album.artist.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: [];

	const hasResults = filteredSongs.length > 0 || filteredAlbums.length > 0;

	
	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		setSearchQuery(query);
		setShowDropdown(query.trim().length > 0);
	};

	const handleSongClick = (song: any) => {
		setCurrentSong(song);
		setShowDropdown(false);
		setSearchQuery("");
	};

	const handleAlbumClick = (albumId: string) => {
		navigate(`/albums/${albumId}`);
		setShowDropdown(false);
		setSearchQuery("");
	};

	return (
		<div className="flex items-center justify-between p-2.5 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-50">
			<div className="flex gap-2 items-center pl-5 cursor-pointer" onClick={() => navigate("/")}>
				<img src="/logo.png" className="size-9 rounded-full" alt="Vibify logo" />
			</div>

			<div className="flex items-center justify-center gap-2 flex-1 max-w-2xl mx-4">
				<button
					className="bg-zinc-600 p-3 rounded-full hover:bg-zinc-500 transition-colors"
					onClick={() => navigate("/")}
					aria-label="Home"
				>
					<Home className="size-6 text-white" />
				</button>

				<div className="relative flex-1 max-w-lg z-50" ref={dropdownRef}>
					<Search className="absolute top-3 left-3 size-6 text-zinc-400 pointer-events-none" />
					<input
						type="text"
						placeholder="What do you want to play?"
						className="bg-zinc-700 rounded-full h-12 w-full pl-12 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white"
						value={searchQuery}
						onChange={handleSearch}
						onFocus={() => searchQuery.trim() && setShowDropdown(true)}
					/>

					{/* Dropdown */}
					{showDropdown && (
						<div className="absolute top-14 left-0 right-0 bg-zinc-800 rounded-lg shadow-xl z-50">
							<ScrollArea className="h-96">
								{!hasResults && searchQuery.trim() && (
									<div className="p-4 text-center text-zinc-400">No results found</div>
								)}

								{/* Songs Section */}
								{filteredSongs.length > 0 && (
									<div className="p-2">
										<div className="px-3 py-2 text-xs font-semibold text-zinc-400 flex items-center gap-2">
											<Music className="size-4" />
											Songs
										</div>
										{filteredSongs.slice(0, 5).map((song) => (
											<div
												key={song._id}
												className="flex items-center gap-3 p-2 hover:bg-zinc-700 rounded cursor-pointer"
												onClick={() => handleSongClick(song)}
											>
												<img
													src={song.imageUrl}
													alt={song.title}
													className="size-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{song.title}</p>
													<p className="text-sm text-zinc-400 truncate">{song.artist}</p>
												</div>
											</div>
										))}
									</div>
								)}

								{/* Albums Section */}
								{filteredAlbums.length > 0 && (
									<div className="p-2 border-t border-zinc-700">
										<div className="px-3 py-2 text-xs font-semibold text-zinc-400 flex items-center gap-2">
											<Disc className="size-4" />
											Albums
										</div>
										{filteredAlbums.slice(0, 5).map((album) => (
											<div
												key={album._id}
												className="flex items-center gap-3 p-2 hover:bg-zinc-700 rounded cursor-pointer"
												onClick={() => handleAlbumClick(album._id)}
											>
												<img
													src={album.imageUrl}
													alt={album.title}
													className="size-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-white font-medium truncate">{album.title}</p>
													<p className="text-sm text-zinc-400 truncate">{album.artist}</p>
												</div>
											</div>
										))}
									</div>
								)}
							</ScrollArea>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4 pr-5">
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboard className="size-4 mr-2" />
						Admin Dashboard
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};

export default Topbar;