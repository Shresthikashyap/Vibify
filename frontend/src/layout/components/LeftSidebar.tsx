import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Library, Heart } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading, likedSongs, fetchLikedSongs } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
		fetchLikedSongs();
	}, [fetchAlbums, fetchLikedSongs]);

	console.log({ albums });

	return (
		<div className='h-full flex flex-col gap-2'>
			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Playlists</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-300px)]'>
					<div className='space-y-2'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							<>
								{/* Liked Songs - Always at the top */}
								{likedSongs.length > 0 && (
									<Link
										to={`/albums/Liked Songs`}
										className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
									>
										<div className='size-12 rounded-md flex-shrink-0 bg-gradient-to-br from-purple-700 via-purple-500 to-pink-500 flex items-center justify-center'>
											<Heart className='size-6 text-white fill-white' />
										</div>

										<div className='flex-1 min-w-0 hidden md:block'>
											<p className='font-medium truncate text-white'>Liked Songs</p>
											<p className='text-sm text-zinc-400 truncate'>
												Playlist • {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
											</p>
										</div>
									</Link>
								)}

								{/* Regular Albums */}
								{albums.map((album) => (
									<Link
										to={`/albums/${album._id}`}
										key={album._id}
										className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
									>
										<img
											src={album.imageUrl}
											alt='Playlist img'
											className='size-12 rounded-md flex-shrink-0 object-cover'
										/>

										<div className='flex-1 min-w-0 hidden md:block'>
											<p className='font-medium truncate'>{album.title}</p>
											<p className='text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
										</div>
									</Link>
								))}
							</>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;