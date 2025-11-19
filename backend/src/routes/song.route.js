// song.route.js
import { Router } from "express";
import {
	getAllSongs,
	getFeaturedSongs,
	getMadeForYouSongs,
	getTrendingSongs,
	getNewReleasesSongs,
	getPopularSongs,
	toggleLikeSong,
	getLikedSongs,
	checkIfLiked,
} from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/new-releases", getNewReleasesSongs);
router.get("/popular", getPopularSongs);

// Liked songs routes
router.post("/like/:songId", protectRoute, toggleLikeSong);
router.get("/liked", protectRoute, getLikedSongs);
router.get("/liked/:songId", protectRoute, checkIfLiked);

export default router;