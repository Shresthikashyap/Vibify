import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Music2, PanelRightClose, User, Calendar, Clock, Heart } from "lucide-react";
import { useEffect } from "react";

const RightSidebar = () => {
	const { currentSong, toggleRightSidebar } = usePlayerStore();
	const { toggleLikeSong, isLikedSong, fetchLikedSongs } = useMusicStore();

	// Fetch liked songs when component mounts
	useEffect(() => {
		fetchLikedSongs();
	}, [fetchLikedSongs]);

	if (!currentSong) {
		return <EmptyState />;
	}

	const liked = isLikedSong(currentSong._id);

	const handleToggleLike = () => {
		toggleLikeSong(currentSong._id);
	};

	return (
		<div className='h-full bg-zinc-900 rounded-lg flex flex-col'>
			{/* Header */}
			<div className='p-4 border-b border-zinc-800'>
				<div className="flex justify-between">
					<div className='flex items-center gap-2'>
						<Music2 className='size-5 shrink-0' />
						<h2 className='font-semibold'>Now Playing</h2>
					</div>
					<PanelRightClose className="size-5 shrink-0 cursor-pointer hover:text-white" 
						onClick={() => toggleRightSidebar(false)}
					/>
				</div>
			</div>

			<ScrollArea className='flex-1'>
				<div className='p-6 space-y-6'>
					{/* Album Art */}
					<div className='relative aspect-square rounded-lg overflow-hidden shadow-2xl'>
						<img
							src={currentSong.imageUrl}
							alt={currentSong.title}
							className='w-full h-full object-cover'
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
					</div>

					{/* Song Info */}
					<div className='space-y-3'>
						<div className="flex justify-between items-start gap-3">
							<div className="flex-1">
								<h3 className='text-2xl font-bold text-white mb-1'>
									{currentSong.title}
								</h3>
								<p className='text-lg text-zinc-400'>
									{currentSong.artist}
								</p>
							</div>
							<button 
								onClick={handleToggleLike}
								className="mt-1 hover:scale-110 transition-transform"
							>
								<Heart 
									className={`size-6 ${
										liked 
											? 'fill-emerald-500 text-emerald-500' 
											: 'text-zinc-400 hover:text-white'
									}`}
								/>
							</button>
						</div>

						{/* Additional Info */}
						<div className='space-y-2 pt-4 border-t border-zinc-800'>
							<InfoRow
								icon={<User className='size-4' />}
								label='Artist'
								value={currentSong.artist}
							/>
							{currentSong.albumId && (
								<InfoRow
									icon={<Music2 className='size-4' />}
									label='Album'
									value={currentSong.title}
								/>
							)}
							<InfoRow
								icon={<Clock className='size-4' />}
								label='Duration'
								value={formatDuration(currentSong.duration)}
							/>
							{currentSong.createdAt && (
								<InfoRow
									icon={<Calendar className='size-4' />}
									label='Added'
									value={new Date(currentSong.createdAt).toLocaleDateString()}
								/>
							)}
						</div>
					</div>

					{/* Credits Section */}
					<div className='pt-4 border-t border-zinc-800'>
						<h4 className='text-sm font-semibold text-white mb-3'>Credits</h4>
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<span className='text-sm text-zinc-400'>Artist</span>
								<button className='text-sm text-white hover:underline'>
									{currentSong.artist}
								</button>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default RightSidebar;

const EmptyState = () => (
	<div className='h-full bg-zinc-900 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-4'>
		<div className='relative'>
			<div
				className='absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg
       opacity-75 animate-pulse'
				aria-hidden='true'
			/>
			<div className='relative bg-zinc-900 rounded-full p-4'>
				<Music2 className='size-8 text-emerald-400' />
			</div>
		</div>

		<div className='space-y-2 max-w-[250px]'>
			<h3 className='text-lg font-semibold text-white'>No Track Playing</h3>
			<p className='text-sm text-zinc-400'>
				Select a song from your library to see details here
			</p>
		</div>
	</div>
);

const InfoRow = ({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) => (
	<div className='flex items-center justify-between text-sm'>
		<div className='flex items-center gap-2 text-zinc-400'>
			{icon}
			<span>{label}</span>
		</div>
		<span className='text-white font-medium'>{value}</span>
	</div>
);

const formatDuration = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};