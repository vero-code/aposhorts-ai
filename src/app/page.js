// src/app/page.js
"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [genre, setGenre] = useState('comedy');
  const [geminiOutput, setGeminiOutput] = useState('');

  const [album, setAlbum] = useState('');
  const [artist, setArtist] = useState('');
  const [book, setBook] = useState('');
  const [brand, setBrand] = useState('');
  const [destination, setDestination] = useState('');
  const [movie, setMovie] = useState('');
  const [person, setPerson] = useState('');
  const [place, setPlace] = useState('');
  const [podcast, setPodcast] = useState('');
  const [tvShow, setTVShow] = useState('');
  const [game, setGame] = useState('');

  const CATEGORY_URN_MAP = {
    album: "album",
    artist: "artist",
    book: "book",
    brand: "brand",
    destination: "destination",
    movie: "movie",
    person: "person",
    place: "place",
    podcast: "podcast",
    tv_show: "tv_show",
    video_game: "videogame",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setGeminiOutput('');

    // 1. Collecting tastes
    const rawTastes = [
      { key: "album", value: album },
      { key: "artist", value: artist },
      { key: "book", value: book },
      { key: "brand", value: brand },
      { key: "destination", value: destination },
      { key: "movie", value: movie },
      { key: "person", value: person },
      { key: "place", value: place },
      { key: "podcast", value: podcast },
      { key: "tv_show", value: tvShow },
      { key: "video_game", value: game },
    ]
      .filter(item => item.value.trim() !== '')
      .map(item => ({
        category: CATEGORY_URN_MAP[item.key],
        value: item.value,
      }));

    try {
      // 2. For each taste - search entity_id via /search
      const res = await fetch('/api/resolve-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawTastes),
      });

      const data = await res.json();
      // console.log('✅ Received entity_ids:', data.resolvedEntities);

      // 3. Request insights in Qloo
      const insightsRes = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.resolvedEntities),
      });

      const insightsData = await insightsRes.json();
      // console.log("🧠 Received insights from Qloo:", insightsData);
      setResult(insightsData.insights);

      // 4. Request to Google Gemini
      if (insightsData && insightsData.insights && insightsData.insights.length > 0) {
        const geminiRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insightsData),
        });

        const geminiData = await geminiRes.json();
        setGeminiOutput(geminiData.result);
      } else {
        console.log("No insights received from Qloo API.");
        setGeminiOutput('No relevant recommendations found from Qloo. Try different interests.');
      }
    } catch (err) {
      console.error("Caught an error in handleSubmit:", err);
      setResult({ error: `An error occurred: ${err.message}.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">ApoShorts AI. Apocalypse by Taste.</h1>

        {/*  User input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input type="text" placeholder="Album (e.g. Abbey Road)" className="border rounded px-4 py-2" onChange={(e) => setAlbum(e.target.value)} />
          <input type="text" placeholder="Artist (e.g. Lana Del Rey)" className="border rounded px-4 py-2" onChange={(e) => setArtist(e.target.value)} />
          <input type="text" placeholder="Book (e.g. 1984)" className="border rounded px-4 py-2" onChange={(e) => setBook(e.target.value)} />
          <input type="text" placeholder="Brand (e.g. Nike)" className="border rounded px-4 py-2" onChange={(e) => setBrand(e.target.value)} />
          <input type="text" placeholder="Destination (e.g. Tokyo)" className="border rounded px-4 py-2" onChange={(e) => setDestination(e.target.value)} />
          <input type="text" placeholder="Movie (e.g. Blade Runner)" className="border rounded px-4 py-2" onChange={(e) => setMovie(e.target.value)} />
          <input type="text" placeholder="Person (e.g. Elon Musk)" className="border rounded px-4 py-2" onChange={(e) => setPerson(e.target.value)} />
          <input type="text" placeholder="Place (e.g. Machu Picchu)" className="border rounded px-4 py-2" onChange={(e) => setPlace(e.target.value)} />
          <input type="text" placeholder="Podcast (e.g. This American Life)" className="border rounded px-4 py-2" onChange={(e) => setPodcast(e.target.value)} />
          <input type="text" placeholder="TV Show (e.g. Black Mirror)" className="border rounded px-4 py-2" onChange={(e) => setTVShow(e.target.value)} />
          <input type="text" placeholder="Video Game (e.g. The Last of Us)" className="border rounded px-4 py-2" onChange={(e) => setGame(e.target.value)} />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">
            Generating recommendations... Please wait.
          </div>
        )}

        {result && (
          <pre className="bg-gray-100 p-4 mt-4 text-sm w-full max-w-md overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {geminiOutput && (
          <div className="bg-green-100 p-4 mt-4 text-sm w-full max-w-md rounded">
            <h3 className="font-bold mb-2">Gemini Output</h3>
            <p>{geminiOutput}</p>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
