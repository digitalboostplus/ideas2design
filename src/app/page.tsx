'use client';

import { useState } from "react";
import Link from "next/link"; // Added Link import
import { IoInformationCircle } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { HiDownload } from "react-icons/hi";
import { MdContentCopy, MdCheck, MdSave } from "react-icons/md";
import { fal } from "@fal-ai/client";
import { useAuth } from "src/lib/hooks/useAuth";
import { SignInWithGoogle } from "src/components/SignInWithGoogle";
import { saveImageToGallery } from "src/lib/firebase/firebaseUtils";

interface GeneratedImage {
  url: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: "fal-ai/ideogram/v2",
    name: "Ideogram v2",
    description: "Latest version with enhanced image quality"
  },
  {
    id: "fal-ai/fast-sdxl",
    name: "Fast SDXL",
    description: "Optimized for speed with good quality"
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    description: "High quality image generation"
  }
];

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);
  const [savingStates, setSavingStates] = useState<string[]>([]); // Added for saving feedback: "idle", "saving", "saved", "error"
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const { user, loading, signOut } = useAuth();

  const handleSaveToGallery = async (imageUrl: string, index: number) => {
    if (!user) return;

    setSavingStates(prev => {
      const newStates = [...prev];
      newStates[index] = "saving";
      return newStates;
    });

    try {
      await saveImageToGallery(imageUrl, inputValue, selectedModel.id);
      setSavingStates(prev => {
        const newStates = [...prev];
        newStates[index] = "saved";
        return newStates;
      });
      setTimeout(() => {
        setSavingStates(prev => {
          const newStates = [...prev];
          newStates[index] = "idle";
          return newStates;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to save image to gallery:", error);
      setSavingStates(prev => {
        const newStates = [...prev];
        newStates[index] = "error";
        return newStates;
      });
      setTimeout(() => {
        setSavingStates(prev => {
          const newStates = [...prev];
          newStates[index] = "idle";
          return newStates;
        });
      }, 3000);
    }
  };

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });
      setTimeout(() => {
        setCopiedStates(prev => {
          const newStates = [...prev];
          newStates[index] = false;
          return newStates;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;
    
    setIsGenerating(true);
    setShowImages(true);
    setGeneratedImages([]);
      setSavingStates(Array(4).fill("idle")); // Reset saving states

    try {
      // Configure fal client
      fal.config({
        credentials: process.env.NEXT_PUBLIC_FAL_KEY
      });

      // Generate 4 images in parallel
      const imagePromises = Array(4).fill(null).map(() => 
        fal.subscribe(selectedModel.id, {
          input: {
            prompt: inputValue,
            aspect_ratio: "1:1",
            style: "auto"
          }
        })
      );

      const results = await Promise.all(imagePromises);
      const images = results.map(result => result.data.images[0]);
      setGeneratedImages(images);
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <main className="min-h-screen bg-white relative">
      {/* Dotted Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50 -z-10" />

      {/* Top Navigation Bar */}
      <nav className="relative bg-gray-700/90 backdrop-blur-sm text-white p-4 shadow-md z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Information about APIs"
            >
              <IoInformationCircle className="w-6 h-6" />
            </button>
            {loading ? (
              <span className="text-white">Loading...</span>
            ) : user ? (
              <>
                <span className="text-white">Welcome, {user.displayName || 'User'}</span>
                <Link href="/gallery" className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Gallery
                </Link>
                <button
                  onClick={signOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <SignInWithGoogle />
            )}
          </div>
        </div>
      </nav>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">What is an API?</h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <IoMdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>
                Think of an API (Application Programming Interface) like a restaurant's waiter:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p>🍽️ <strong>The Restaurant Analogy:</strong></p>
                <ul className="list-disc ml-4 mt-2 space-y-2">
                  <li>You (the customer) don't go directly to the kitchen</li>
                  <li>Instead, you tell the waiter what you want</li>
                  <li>The waiter takes your request to the kitchen</li>
                  <li>The kitchen prepares your food</li>
                  <li>The waiter brings back your order</li>
                </ul>
              </div>
              <p>
                Similarly, an API is like a waiter between your app and other services - it takes your requests, gets what you need, and brings back the results!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto p-6 space-y-8 z-10">
        {/* Image Description Input */}
        <div className="w-full max-w-2xl mx-auto flex gap-4">
          <div className="relative min-w-[200px]">
            <select
              value={selectedModel.id}
              onChange={(e) => setSelectedModel(AI_MODELS.find(model => model.id === e.target.value) || AI_MODELS[0])}
              className="w-full p-4 rounded-lg bg-blue-50 border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-gray-800 appearance-none cursor-pointer"
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id} className="py-2">
                  {model.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to generate..."
            className="flex-1 p-4 rounded-lg bg-blue-50 border border-blue-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Image Grid */}
        {showImages && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg border border-gray-200 overflow-hidden ${
                  isGenerating ? 'animate-pulse' : 'bg-gray-100'
                }`}
              >
                {isGenerating ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-gray-200 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm text-gray-600">Generating...</span>
                    </div>
                  </div>
                ) : generatedImages[index] ? (
                  <div className="group relative">
                    <img 
                      src={generatedImages[index].url} 
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(generatedImages[index].url, index)}
                        className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-all transform hover:scale-105"
                        title="Copy image URL"
                      >
                        {copiedStates[index] ? (
                          <MdCheck className="w-5 h-5 text-green-500 animate-bounce" />
                        ) : (
                          <MdContentCopy className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedImages[index].url, index)}
                        className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-all transform hover:scale-105"
                        title="Download image"
                      >
                        <HiDownload className="w-5 h-5 text-gray-700" />
                      </button>
                      {user && (
                        <button
                          onClick={() => handleSaveToGallery(generatedImages[index].url, index)}
                          disabled={savingStates[index] === "saving" || savingStates[index] === "saved"}
                          className={`p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-all transform hover:scale-105 ${
                            savingStates[index] === "saving" ? "cursor-not-allowed" : ""
                          } ${
                            savingStates[index] === "saved" ? "bg-green-100 hover:bg-green-100" : ""
                          } ${
                            savingStates[index] === "error" ? "bg-red-100 hover:bg-red-100" : ""
                          }`}
                          title={
                            savingStates[index] === "saved" ? "Saved!" :
                            savingStates[index] === "error" ? "Error saving" :
                            "Save to Gallery"
                          }
                        >
                          {savingStates[index] === "saving" && (
                            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                          )}
                          {savingStates[index] === "saved" && (
                            <MdCheck className="w-5 h-5 text-green-500" />
                          )}
                           {(savingStates[index] === "idle" || !savingStates[index]) && (
                            <MdSave className="w-5 h-5 text-gray-700" />
                          )}
                          {savingStates[index] === "error" && (
                             <IoMdClose className="w-5 h-5 text-red-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Generated Image {index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
