// src/app/page.js
"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { DrawCircleText } from "@/components/DrawCircleText";
import { motion } from "framer-motion";

export default function Home() {
  const [tastes, setTastes] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [geminiOutput, setGeminiOutput] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const tasteFields = [
    { key: "album", label: "Album (e.g. Abbey Road)" },
    { key: "artist", label: "Artist (e.g. Lana Del Rey)" },
    { key: "book", label: "Book (e.g. 1984)" },
    { key: "brand", label: "Brand (e.g. Nike)" },
    { key: "destination", label: "Destination (e.g. Tokyo)" },
    { key: "movie", label: "Movie (e.g. Blade Runner)" },
    { key: "person", label: "Person (e.g. Elon Musk)" },
    { key: "place", label: "Place (e.g. Machu Picchu)" },
    { key: "podcast", label: "Podcast (e.g. This American Life)" },
    { key: "tvShow", label: "TV Show (e.g. Black Mirror)" },
    { key: "game", label: "Video Game (e.g. The Last of Us)" },
  ];

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
    tvShow: "tv_show",
    game: "videogame",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setGeminiOutput('');

    // 1. Collecting tastes
    const rawTastes = Object.entries(tastes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => ({
        category: CATEGORY_URN_MAP[key],
        value,
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

  const handleGenerate = async () => {
    setVideoLoading(true);
    setVideoUrl(null);

    try {
      const staticVideoUrl = '/demo/apocalypse-short.mp4';
      setVideoUrl(staticVideoUrl);
    } catch (err) {
      console.error('❌ Unexpected error during video generation:', err);
      alert('Unexpected error while generating video. Please try again later.');
    } finally {
      setVideoLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    Object.values(tastes).every((value) => value.trim() === "");

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-center w-full max-w-7xl container-aposhorts">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center mb-4"
        >
          <DrawCircleText></DrawCircleText>
        </motion.h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-4"
          >
            {tasteFields.map(({ key, label }) => (
              <input
                key={key}
                type="text"
                placeholder={label}
                className="input-aposhorts bg-zinc-900 text-white px-4 py-3 rounded-md border border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                value={tastes[key] || ''}
                onChange={(e) =>
                  setTastes((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            ))}
          </motion.div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 mb-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-aposhorts px-6 py-3 rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 transition text-white text-base font-medium"
            >
              {loading ? '⏳ Generating...' : '📝 Generate Script'}
            </button>

            <button
              onClick={handleGenerate}
              disabled={videoLoading}
              type="button"
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-600 hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoLoading ? '⏳ Generating...' : '🎬 Generate Video'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-4 info-box text-center">
            Generating recommendations... Please wait.
          </div>
        )}

        {result && (
          <div className="result-box w-full">
            <h3 className="font-bold mb-2 text-lg text-accent">Qloo Insights (for Devs/Judges):</h3>
            <div className="text-sm whitespace-pre-wrap font-sans">
              {JSON.stringify(result, null, 2)}
            </div>
          </div>
        )}
        {geminiOutput && (
          <div className="result-box w-full">
            <h3 className="font-bold mb-2 text-lg text-accent">ApoShorts AI Scenario:</h3>
            <ReactMarkdown>{geminiOutput}</ReactMarkdown>
          </div>
        )}

        {/* Video generate */}
        {videoUrl && (
          <div className="mt-6 w-full text-center">
            <h2 className="text-lg mb-4 text-foreground">📽 Your script is ready - watch:</h2>
            <video src={videoUrl} controls autoPlay className="w-full max-w-lg mx-auto rounded-lg shadow-xl border border-accent" />
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="mt-10 text-sm text-zinc-400 hover:text-white underline"
          href="https://github.com/vero-code/aposhorts-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to GitHub →
        </a>
      </footer>
    </div>
  );
}
