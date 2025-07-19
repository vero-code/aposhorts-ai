// src/app/page.js
"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { DrawCircleText } from "@/components/DrawCircleText";
import { motion } from "framer-motion";
import { FileText, Film, RotateCcw, Loader2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const staticVideoUrl = '/demo/apocalypse-short.mp4';
      setVideoUrl(staticVideoUrl);
    } catch (err) {
      console.error('❌ Unexpected error during video generation:', err);
      alert('Unexpected error while generating video. Please try again later.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleReset = () => {
    setTastes({});
    setResult(null);
    setGeminiOutput('');
    setVideoUrl(null);
  };

  const isSubmitDisabled =
    loading ||
    Object.values(tastes).every((value) => value.trim() === "");

  const isGenerateVideoDisabled =
    videoLoading ||
    Object.values(tastes).every((value) => value.trim() === "");

  const isResetDisabled =
    Object.values(tastes).every((v) => v.trim?.() === '') &&
    !result &&
    !geminiOutput &&
    !videoUrl;

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-12 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container-aposhorts flex flex-col gap-[32px] row-start-2 items-center sm:items-center w-full max-w-7xl"
      >
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center mb-4">
          <DrawCircleText />
        </motion.h1>

        {/* Form with inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-4"
          >
            {tasteFields.map(({ key, label }) => (
              <input
                key={key}
                type="text"
                placeholder={label}
                className="input-aposhorts focus:ring-2 focus:ring-purple-500 "
                value={tastes[key] || ''}
                onChange={(e) =>
                  setTastes((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 mb-4 w-full max-w-2xl mx-auto"
          >
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-aposhorts flex items-center justify-center gap-2 flex-1 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Script
                </>
              )}
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerateVideoDisabled}
              type="button"
              className="btn-secondary flex items-center justify-center gap-2 flex-1 text-base"
            >
              {videoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={isResetDisabled}
              type="button"
              className="btn-reset flex items-center justify-center gap-2 flex-1 text-base"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </motion.div>
        </form>

        {loading && (
          <div className="info-box mt-4 text-center">
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
      </motion.main>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"
      >
        <motion.a
          variants={itemVariants}
          className="mt-10 text-sm text-zinc-400 hover:text-white underline"
          href="https://github.com/vero-code/aposhorts-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to GitHub →
        </motion.a>
      </motion.div>
    </div>
  );
}
