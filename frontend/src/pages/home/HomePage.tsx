// import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchNewReleasesSongs,
		fetchPopularSongs,
		isMadeForYouLoading,
		isTrendingLoading,
		isNewReleasesLoading,
		isPopularLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
		newReleasesSongs,
		popularSongs,
	} = useMusicStore();
	const { isAuthenticated } = useAuthStore();

	const { initializeQueue } = usePlayerStore();

	useEffect(() => {
		fetchFeaturedSongs();
		fetchMadeForYouSongs();
		fetchTrendingSongs();
		fetchNewReleasesSongs();
		fetchPopularSongs();
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs,fetchNewReleasesSongs, fetchPopularSongs]);

	useEffect(() => {
		console.log("HomePage songs updated",popularSongs);
		// if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0 && newReleasesSongs.length > 0) {
		if (featuredSongs.length > 0 && trendingSongs.length > 0 && newReleasesSongs.length > 0 && popularSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs, ...newReleasesSongs, ...popularSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs, newReleasesSongs, popularSongs]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			{/* <Topbar /> */}
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Good afternoon</h1>
					<FeaturedSection />

					<div className='space-y-8'>
						{ isAuthenticated && <SectionGrid title='Made For You' songs={madeForYouSongs.slice(0, 4)} isLoading={isMadeForYouLoading} /> }
						<SectionGrid title='Trending' songs={trendingSongs.slice(0, 4)} isLoading={isTrendingLoading} />
						<SectionGrid title='New Releases' songs={newReleasesSongs.slice(0, 4)} isLoading={isNewReleasesLoading} />
						<SectionGrid title='Popular Songs' songs={popularSongs.slice(0, 4)} isLoading={isPopularLoading} />
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
