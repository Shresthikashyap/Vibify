import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { albums, fetchAlbums, fetchAlbumById, currentAlbum, isLoading, madeForYouSongs, trendingSongs, newReleasesSongs, popularSongs, likedSongs, fetchLikedSongs } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay, toggleRightSidebar } = usePlayerStore();

	useEffect(() => {
		if (albumId && albumId !== "Made For You" && albumId !== "Trending") {
			fetchAlbumById(albumId);
		}
		fetchAlbums();
		fetchLikedSongs();
	}, [fetchAlbums, fetchLikedSongs ,fetchAlbumById, albumId]);

	if (isLoading) return null;

	// Determine if we're viewing a category or an album
	const isCategory = albumId === "Made For You" || albumId === "Trending" || albumId === "New Releases" || albumId === "Liked Songs" || albumId === "Popular Songs";
	const categoryTitle = albumId === "Made For You" ? "Made For You" : albumId === "Trending" ? "Trending" :albumId === "New Releases" ? "New Releases" : albumId === "Liked Songs" ? "Liked Songs" : albumId === "Popular Songs" ? "Popular Songs" : "";
	const categorySongs = albumId === "Made For You" ? madeForYouSongs : albumId === "Trending" ? trendingSongs: albumId === "New Releases" ? newReleasesSongs : albumId === "Liked Songs" ? likedSongs : albumId === "Popular Songs" ? popularSongs : [];
	
	const displayTitle = isCategory ? categoryTitle : currentAlbum?.title;
	const displayArtist = isCategory ? "Curated playlist for you" : currentAlbum?.artist;
	const displayImage = isCategory ? (categorySongs[0]?.imageUrl || "/logo.png") : currentAlbum?.imageUrl;
	const displaySongs = isCategory ? categorySongs : currentAlbum?.songs || [];
	const displayType = isCategory ? "Playlist" : "Album";
	const displayYear = isCategory ? "" : currentAlbum?.releaseYear;

	const handlePlayAlbum = () => {
		if (displaySongs.length === 0) return;

		const isCurrentPlaylistPlaying = displaySongs.some((song) => song._id === currentSong?._id);
					
		if (isCurrentPlaylistPlaying) togglePlay();
		else {
			// start playing from the beginning
			playAlbum(displaySongs, 0);
			toggleRightSidebar(true);
		}
	};

	const handlePlaySong = (index: number) => {
		if (displaySongs.length === 0) return;

		playAlbum(displaySongs, index);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className={`absolute inset-0 bg-gradient-to-b ${
							isCategory 
								? 'from-purple-600/80 via-zinc-900/80' 
								: 'from-[#5038a0]/80 via-zinc-900/80'
						} to-zinc-900 pointer-events-none`}
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<img
								src={displayImage}
								alt={displayTitle}
								className='w-[240px] h-[240px] shadow-xl rounded'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>{displayType}</p>
								<h1 className='text-7xl font-bold my-4'>{displayTitle}</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span className='font-medium text-white'>{displayArtist}</span>
									<span>• {displaySongs.length} songs</span>
									{displayYear && <span>• {displayYear}</span>}
								</div>
							</div>
						</div>

						{/* play button */}
						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                hover:scale-105 transition-all'
							>
								{isPlaying && displaySongs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>
						</div>

						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header */}
							<div
								className='grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-10 py-2 text-sm 
            text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Title</div>
								<div>{isCategory ? 'Album' : 'Released Date'}</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
							</div>

							{/* songs list */}
							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{displaySongs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										return (
											<div
												key={song._id}
												onClick={() => {
													handlePlaySong(index);
													toggleRightSidebar(true);
												}}
												className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm 
                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                      `}
											>
												<div className='flex items-center justify-center'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-green-500'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10' />

													<div>
														<div className={`font-medium text-white`}>{song.title}</div>
														<div>{song.artist}</div>
													</div>
												</div>
												<div className='flex items-center'>
													{isCategory
														? albums?.find((a) => song.albumId === a._id)?.title ?? "Single"
														: song.createdAt?.split("T")[0] || "N/A"}
												</div>
												<div className='flex items-center'>{formatDuration(song.duration)}</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
export default AlbumPage;