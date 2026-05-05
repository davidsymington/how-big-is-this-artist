// This is your backend function that Spotify will run
// It takes an artist name and returns their data from Spotify

// These are your credentials from the Spotify Developer Dashboard
const CLIENT_ID = "50da93f71b104b4a81be9952eaca7adf";
const CLIENT_SECRET = "18c5e8617ec047538233013c60236fcc";

// This is the main function that runs when someone calls your API
export default async function handler(req, res) {
  try {
    // Get the artist name from the request (e.g., ?artistName=The+Beatles)
    const { artistName } = req.query;

    if (!artistName) {
      return res.status(400).json({ error: "Please provide an artistName" });
    }

    // STEP 1: Get an access token from Spotify
    // This is like showing your ID card to Spotify to prove you're allowed to use their API
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // STEP 2: Search for the artist on Spotify using your access token
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const searchData = await searchResponse.json();
    const artist = searchData.artists.items[0]; // Get the first result

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // STEP 3: Return the important data
    return res.status(200).json({
      name: artist.name,
      followers: artist.followers.total,
      popularity: artist.popularity, // 0-100 score
      images: artist.images[0]?.url,
      externalUrl: artist.external_urls.spotify,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
