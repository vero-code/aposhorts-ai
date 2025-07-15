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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setGeminiOutput('');

    // 1. Collecting tastes
    const rawTastes = [
      { category: "album", value: album },
      { category: "artist", value: artist },
      { category: "book", value: book },
      { category: "brand", value: brand },
      { category: "destination", value: destination },
      { category: "movie", value: movie },
      { category: "person", value: person },
      { category: "place", value: place },
      { category: "podcast", value: podcast },
      { category: "tv_show", value: tvShow },
      { category: "video_game", value: game },
    ].filter(item => item.value.trim() !== '');
    console.log(rawTastes);

    try {
      // 2. For each taste - search entity_id via /search
      const res = await fetch('/api/resolve-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawTastes),
      });

      const data = await res.json();
      console.log('✅ Received entity_ids:', data.resolvedEntities);

      // // 4. Query to Qloo
      // const res = await fetch('/api/predict', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     tastes: input.split(',').map(t => t.trim()),
      //     genre
      //   }),
      // });
      //
      // const data = await res.json();
      // setResult(data);
      // console.log("Qloo API Response Data:", data);

      // 5. Request to Google Gemini
      // if (Array.isArray(data) && data.length > 0) {
      //   const geminiRes = await fetch('/api/generate', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       movies: data,
      //     }),
      //   });
      //
      //   const geminiData = await geminiRes.json();
      //   setGeminiOutput(geminiData.result);
      // } else {
      //   console.log("No entities received from Qloo API or data is not an array.");
      //   setResult({ error: 'No relevant recommendations found from Qloo. Try different tastes or genre.' });
      // }
    } catch (err) {
      console.error("Caught an error in handleSubmit:", err);
      setResult({ error: `Failed to fetch recommendations: ${err.message}. Please check console for details.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">ApoShorts AI. Apocalypse by Taste.</h1>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>

        {/*  User input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input type="text" placeholder="Album (e.g. Abbey Road)" className="border rounded px-4 py-2" onChange={(e) => setAlbum(e.target.value)} />
          <input type="text" placeholder="Artist (e.g. Lana Del Rey)" className="border rounded px-4 py-2" onChange={(e) => setArtist(e.target.value)} />
          <input type="text" placeholder="Book (e.g. 1984)" className="border rounded px-4 py-2" onChange={(e) => setBook(e.target.value)} />
          <input type="text" placeholder="Brand (e.g. Nike)" className="border rounded px-4 py-2" onChange={(e) => setBrand(e.target.value)} />
          <input type="text" placeholder="Destination (e.g. Iceland)" className="border rounded px-4 py-2" onChange={(e) => setDestination(e.target.value)} />
          <input type="text" placeholder="Movie (e.g. Blade Runner)" className="border rounded px-4 py-2" onChange={(e) => setMovie(e.target.value)} />
          <input type="text" placeholder="Person (e.g. Elon Musk)" className="border rounded px-4 py-2" onChange={(e) => setPerson(e.target.value)} />
          <input type="text" placeholder="Place (e.g. Balthazar)" className="border rounded px-4 py-2" onChange={(e) => setPlace(e.target.value)} />
          <input type="text" placeholder="Podcast (e.g. The Daily)" className="border rounded px-4 py-2" onChange={(e) => setPodcast(e.target.value)} />
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
