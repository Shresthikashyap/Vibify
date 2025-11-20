import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import callGeminiAPI from "../services/GeminiService.js";

// Toggle like/unlike a song
export const toggleLikeSong = async (req, res) => {
	try {
		const { songId } = req.params;
		const userId = req.auth.userId; // From Clerk auth

		const user = await User.findOne({ clerkId: userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const song = await Song.findById(songId);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		const isLiked = user.likedSongs.includes(songId);

		if (isLiked) {
			// Unlike the song
			user.likedSongs = user.likedSongs.filter(
				(id) => id.toString() !== songId
			);
			song.likes = Math.max(0, song.likes - 1);
		} else {
			// Like the song
			user.likedSongs.push(songId);
			song.likes += 1;
		}

		await user.save();
		await song.save();

		res.status(200).json({
			message: isLiked ? "Song unliked" : "Song liked",
			isLiked: !isLiked,
			likes: song.likes,
		});
	} catch (error) {
		console.error("Error in toggleLikeSong:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get all liked songs for a user
export const getLikedSongs = async (req, res) => {
	try {
		const userId = req.auth.userId;

		const user = await User.findOne({ clerkId: userId }).populate({
			path: "likedSongs",
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.likedSongs);
	} catch (error) {
		console.error("Error in getLikedSongs:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Check if a song is liked by user
export const checkIfLiked = async (req, res) => {
	try {
		const { songId } = req.params;
		const userId = req.auth.userId;

		const user = await User.findOne({ clerkId: userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isLiked = user.likedSongs.includes(songId);
		res.status(200).json({ isLiked });
	} catch (error) {
		console.error("Error in checkIfLiked:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.aggregate([
			{
				$sample: { size: 6 },
			},
			// {
			// 	$project: {
			// 		_id: 1,
			// 		title: 1,
			// 		artist: 1,
			// 		imageUrl: 1,
			// 		audioUrl: 1,
			// 	},
			// },
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

// export const getMadeForYouSongs = async (req, res, next) => {
// 	try {
// 		const songs = await Song.aggregate([
// 			{
// 				$sample: { size: 4 },
// 			},
// 			// {
// 			// 	$project: {
// 			// 		_id: 1,
// 			// 		title: 1,
// 			// 		artist: 1,
// 			// 		imageUrl: 1,
// 			// 		audioUrl: 1,
// 			// 	},
// 			// },
// 		]);

// 		res.json(songs);
// 	} catch (error) {
// 		next(error);
// 	}
// };

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const userId = req.auth.userId;

		// Get user with their liked songs
		const user = await User.findOne({ clerkId: userId }).populate("likedSongs");

		// If user has no liked songs, return random songs
		if (!user || user.likedSongs.length === 0) {
			const songs = await Song.aggregate([
				{
					$sample: { size: 4 },
				},
			]);
			return res.json(songs);
		}

		// Get all available songs
		const allSongs = await Song.find();

		// Prepare data for Gemini
		const likedSongsInfo = user.likedSongs.map(song => ({
			title: song.title,
			artist: song.artist,
		}));

		const availableSongsInfo = allSongs.map(song => ({
			id: song._id.toString(),
			title: song.title,
			artist: song.artist,
		}));

		// Create prompt for Gemini
		const prompt = `You are a music recommendation expert. Based on the user's liked songs, recommend 4 songs from the available songs list that they would enjoy.

		User's Liked Songs:
		${JSON.stringify(likedSongsInfo, null, 2)}

		Available Songs (choose from these):
		${JSON.stringify(availableSongsInfo, null, 2)}

		Instructions:
		1. Analyze the user's music taste based on their liked songs
		2. Select 4 songs from the available songs list that match their preferences
		3. Consider artist similarity, genre, and musical style
		4. DO NOT recommend songs that are already in the user's liked songs
		5. Return ONLY a JSON array of song IDs (nothing else)

		Example format: ["id1", "id2", "id3", "id4"]

		Your response (JSON array only):`;

		// Call Gemini API
		const geminiResponse = await callGeminiAPI(prompt);
		console.log('Gemini Response:', geminiResponse);
		
		// Parse the response to get song IDs
		let recommendedIds = [];
		try {
			// Clean the response to extract JSON array
			const cleanedResponse = geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
			recommendedIds = JSON.parse(cleanedResponse);
		} catch (parseError) {
			console.error("Failed to parse Gemini response:", geminiResponse);
			// Fallback to random songs if parsing fails
			const songs = await Song.aggregate([{ $sample: { size: 4 } }]);
			return res.json(songs);
		}

		// Fetch the recommended songs
		const recommendedSongs = await Song.find({
			_id: { $in: recommendedIds }
		});

		// If we got fewer than 4 songs, fill with random songs
		if (recommendedSongs.length < 4 || geminiResponse.error) {
			const additionalSongs = await Song.aggregate([
				{
					$match: {
						_id: { 
							$nin: [
								...recommendedSongs.map(s => s._id),
								...user.likedSongs.map(s => s._id)
							]
						}
					}
				},
				{
					$sample: { size: 4 - recommendedSongs.length }
				}
			]);
			recommendedSongs.push(...additionalSongs);
		}

		const songs = recommendedSongs.slice(0, 4);
		res.json(songs);
	} catch (error) {
		console.error("Error in getMadeForYouSongs:", error);
		next(error);
	}
};
export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			// {
			// 	$project: {
			// 		_id: 1,
			// 		title: 1,
			// 		artist: 1,
			// 		imageUrl: 1,
			// 		audioUrl: 1,
			// 	},
			// },
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getNewReleasesSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.find({})
		.sort({ createdAt: -1 }) // newest first
		.limit(6);
console.log('New Releases Songs:', songs);
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getPopularSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
		]);

		res.status(200).json(songs);
	} catch (error) {
		next(error);
	}
};