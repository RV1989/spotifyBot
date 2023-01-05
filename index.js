const express = require("express");
require("dotenv").config();
var SpotifyWebApi = require("spotify-web-api-node");
const getSuffix = require("./jasper");
const app = express();
const port = process.env.PORT;
const _ = require("lodash");
const matcher = require("./matcher");
const leaderboard = {};
var skips = [];
var lastSongs = [];
const ONE_HOUR = 60 * 60 * 1000; /* ms */
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

const getCard = (action, title, artist, cover, user, score) => {
  return `<table style="min-width:200px border:none;">
  <tr>
    <th style="text-align:left;border:none;" colspan="2" ><strong>${action} ${
    user ? "by " + user : ""
  } ${getSuffix(user, score)}</strong></th >
 </tr >
  <tr>
    <td width="56"><img src="${cover}" alt="cover img" width="56" height="56" style="margin-right: 1em;border:none;"></td>
    <td style="margin-right: 35px;border:none;">
      <div>
        <span style="font-size:1.2em "><strong>${title}</strong></span><br />
        <span style="font-size:0.9em">${artist}</span>
      </div>
    </td>

  </tr>

</table > `;
};

const spotifyApi = new SpotifyWebApi({
  redirectUri: `${process.env.URI}/callback`,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

app.use(express.json());

app.post("/", async (req, res) => {
  try {
    if (leaderboard[_.startCase(_.camelCase(req.body.user))] === undefined) {
      leaderboard[_.startCase(_.camelCase(req.body.user))] = 0.0;
    }
    const result = await spotifyCommand(
      req.body.plainTextContent,
      _.startCase(_.camelCase(req.body.user))
    );
    leaderboard[_.startCase(_.camelCase(req.body.user))] =
      parseFloat(leaderboard[_.startCase(_.camelCase(req.body.user))]) +
      parseFloat(result.score);
    res.send(result.message);
  } catch (error) {
    res.send(error);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
  spotifyApi.setAccessToken("");
});

app.get("/logout", (req, res) => {
  spotifyApi.setAccessToken("");
  spotifyApi.setRefreshToken("");
  res.send("Logged out");
});

app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log("access_token:", access_token);
      console.log("refresh_token:", refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send("Success! You can now close the window.");

      setInterval(async () => {
        if (spotifyApi.getAccessToken() === "") {
          clearInterval(this);
        } else {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body["access_token"];

          console.log("The access token has been refreshed!");
          console.log("access_token:", access_token);
          spotifyApi.setAccessToken(access_token);
        }
      }, (expires_in / 2) * 1000);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

const spotifyCommand = async (command, user) => {
  console.log(`⚡\t${command} \tby: ${user}`);

  const data = await matcher(command);
  switch (data.intent) {
    case "help":
      return Promise.resolve({
        message: `
    <h1>Spotify Commands</h1>
    <a href="${process.env.URI}/login">Login</a><br/>
    <a href="${process.env.URI}/logout">Logout</a><br/>
    <p>Commands:<p>
    <ul>
      <li>queue <song> - Queues a song</li>
      <li>current - Shows the current song playing</li>
      <li>next - Skips to the next song</li>
      <li>leaderboard - Shows the leaderboard</li>
      <li>ps. Jasper doet kaka in zijn broek
    </ul>`,
        score: 0.0,
      });

      break;

    case "current":
      try {
        const currentSong = await spotifyApi.getMyCurrentPlayingTrack();
        const cover = currentSong.body.item.album.images[0].url;
        const title = currentSong.body.item.name;
        const artist = currentSong.body.item.artists
          .map((artist) => artist.name)
          .join(",");
        return Promise.resolve({
          message: getCard("Now Playing", title, artist, cover, "", 0.5),
          score: 0.5,
        });
      } catch (error) {
        return Promise.reject(
          `${error?.body?.error?.message ? error.body.error.message : error} 😭`
        );
      }
      break;

    case "queue":
      if (data.entities.groups.Song?.trim() === "") {
        return Promise.resolve({
          message: `No song title provided 🤬☠💣`,
          score: -12.0,
        });
      }
      let songs = await spotifyApi
        .searchTracks(data.entities.groups.Song.trim())
        .catch((error) =>
          Promise.reject(
            `${
              error?.body?.error?.message ? error.body.error.message : error
            } 😭`
          )
        );
      if (songs.body.tracks.items.length === 0) {
        return Promise.resolve({ message: `Song not found 😭`, score: -0.5 });
      }
      if (lastSongs.find((song) => song === songs.body.tracks.items[0].uri)) {
        return Promise.resolve({
          message: `Fuck you met je spam 🤬☠💣`,
          score: -5.0,
        });
      }

      if (lastSongs.length > 10) {
        lastSongs.shift();
      }
      try {
        const addedSong = songs.body.tracks.items[0];
        await spotifyApi.addToQueue(addedSong.uri);
        //const addedSong = await spotifyApi.getTracks(songs.body.items[0].trackIds)
        lastSongs.push(songs.body.tracks.items[0].uri);
        const cover = addedSong.album.images[0]?.url;
        const title = addedSong.name;
        const artist = addedSong.artists.map((artist) => artist.name).join(",");
        let score = Math.floor(Math.random() * 5) + 1;
        if (user === "Opsomer Jasper") {
          user = "🎇💩 OPSOMEISTER 💩🎇";
        }

        let containsKakaInBroek = title.search("Kaka In Zijn Broek")

        if (containsKakaInBroek != -1 ){
          score = -10;
          user = user + "Kust mijn kloten met je kutmuziek"; }
 
   

        return Promise.resolve({
          message: getCard("Added", title, artist, cover, user, score),
          score: score,
        });
      } catch (error) {
        return Promise.reject(
          `${error?.body?.error?.message ? error.body.error.message : error} 😭`
        );
      }

      break;

    case "next":
      try {
        if (leaderboard[user] < 5.0) {
          return Promise.resolve({
            message: `You need to have at least 5 points to skip a song 😭`,
            score: -0.5,
          });
        }
        await spotifyApi.skipToNext();
        skips.push({ user: user, time: new Date() });
        skips = skips.filter((skip) => {
          let now = new Date();
          let res = now - skip.time < ONE_HOUR;
          return res;
        });
        let skipsOfUser = skips.filter((skip) => skip.user === user).length;
        return Promise.resolve({
          message: "Skipped to next song 🎶",
          score: -(5.0 * skipsOfUser),
        });
      } catch (error) {
        return Promise.reject("Could not skip to next song 😭");
      }
      break;

    case "leaderboard":
      const leaderboardArray = Object.keys(leaderboard)
        .map((key) => {
          return { name: key, score: leaderboard[key] };
        })
        .sort((a, b) => {
          return b.score - a.score;
        });
      leaderboardHtml = `<h1>Leaderboard</h1>
        <ol>
        ${leaderboardArray
          .map((x) => `<li>${x.name}\t${x.score} ${getSuffix(x.name, 1)}</li>`)
          .join("")}
        </ol>
        `;
      return Promise.resolve({ message: leaderboardHtml, score: 0.0 });
      break;
    default:
      return Promise.resolve({
        message: `command not Found "${command}" 🤬`,
        score: -5.0,
      });
      break;
  }
};
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
