import Topbar from "@/components/Topbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { isRightSidebarOpen } = usePlayerStore(); 

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<Topbar />
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				{/* left sidebar */}
				<ResizablePanel 
				defaultSize={16} minSize={isMobile ? 0 : 10} maxSize={25}
				
				>
					<LeftSidebar />
				</ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<Outlet />
				</ResizablePanel>

				{!isMobile && isRightSidebarOpen && (
					<>
						<ResizableHandle className='hidden lg:block w-2 bg-black rounded-lg transition-colors' />
						<ResizablePanel 
							// defaultSize={25} 
							// minSize={15} 
							maxSize={25} 
							collapsedSize={0}
							className="hidden lg:block lg:min-w-60 xl:min-w-60 2xl:min-w-60"
						>
							<RightSidebar />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<PlaybackControls />
		</div>
	);
};
export default MainLayout;
