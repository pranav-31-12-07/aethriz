"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PatientNavbar from "@/components/navigation/PatientNavbar";
import { useLanguage } from "@/lib/language";
import { fetchArticles, ArticleRecord } from "@/lib/data";
import EmptyState from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";

export default function HealthStoriesPage() {
  const [language] = useLanguage();
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [activeArticle, setActiveArticle] = useState<ArticleRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New story submission form state
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryQuote, setNewStoryQuote] = useState("");

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      const data = await fetchArticles();
      setArticles(data);
      setIsLoading(false);
    }
    loadArticles();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const toggleBookmark = (id: string, title: string) => {
    setBookmarks((prev) => {
      const next = !prev[id];
      triggerToast(next ? `Saved "${title}" to your reading list.` : `Removed "${title}" from reading list.`);
      return { ...prev, [id]: next };
    });
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCategory === "All" ||
        art.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.authorName.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleShareStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle || !newStoryQuote) return;
    setIsShareModalOpen(false);
    setNewStoryTitle("");
    setNewStoryQuote("");
    triggerToast("Your article contribution has been submitted for clinical moderation. Thank you!");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1D1F22] font-sans antialiased selection:bg-[#E3202B] selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* ============ STANDARD PATIENT NAVBAR ============ */}
      <PatientNavbar activeTab="stories" />

      {/* ============ MAIN STORIES CONTAINER ============ */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        
        {/* ============ HEADER & BREADCRUMBS ============ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
              <span>{language === "hi" ? "होम / लेख एवं अंतर्दृष्टि" : "Home / Articles & Insights"}</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3202B]" />
                {language === "hi" ? "डॉक्टरों द्वारा समीक्षित" : "Verified Clinical Publications"}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[#1D1F22] mt-1"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {language === "hi" ? (
                <>
                  स्वास्थ्य लेख और{" "}
                  <span className="italic text-[#E3202B] font-serif font-normal">
                    जानकारियाँ।
                  </span>
                </>
              ) : (
                <>
                  Health publications &{" "}
                  <span className="italic text-[#E3202B] font-serif font-normal">
                    insights.
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 max-w-xl">
              {language === "hi"
                ? "डॉक्टरों द्वारा जांची गई मार्गदर्शिकाएँ और साक्ष्य-आधारित विश्लेषण।"
                : "Doctor-authored clinical guides and verified health insights, published directly by registered medical specialists."}
            </p>
          </div>

          {/* Contribute Article Button */}
          <div>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#E3202B] hover:bg-[#c91822] text-white shadow-[0_8px_20px_rgba(227,32,43,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>{language === "hi" ? "लेख सबमिट करें" : "Contribute publication"}</span>
            </button>
          </div>
        </div>

        {/* ============ SEARCH & FILTER BAR ============ */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search published articles, biomarkers, clinical topics..."
              className="w-full pl-11 pr-14 py-3 rounded-full bg-white border border-slate-200/80 shadow-2xs text-xs sm:text-sm text-[#1D1F22] placeholder:text-slate-400 focus:outline-hidden focus:border-[#E3202B] focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          {/* Category Tabs & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
              {["All", "General health", "Nutrition", "Cardiology", "Endocrinology", "Metabolic"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#E3202B] text-white shadow-xs"
                      : "bg-white text-[#64748B] hover:text-[#1D1F22] border border-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#94A3B8] font-medium">
              Showing {filteredArticles.length} published {filteredArticles.length === 1 ? "article" : "articles"}
            </span>
          </div>
        </div>

        {/* ============ CONTENT AREA ============ */}
        {isLoading ? (
          <CardSkeleton rows={3} />
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => {
              const isBookmarked = !!bookmarks[article.id];

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-[0_10px_25px_rgba(29,31,34,0.03)] flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
                  onClick={() => setActiveArticle(article)}
                >
                  <div className="space-y-3.5">
                    {/* Visual Banner */}
                    <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-rose-50 to-slate-100 p-3.5 flex items-start justify-between relative overflow-hidden shadow-2xs border border-slate-200/60">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#1D1F22] border border-slate-200">
                        {article.category}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/70 text-white ml-auto">
                        ⏱ {article.readTime}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <p className="text-[11px] font-semibold text-[#64748B]">
                      By <strong className="text-[#1D1F22]">{article.authorName}</strong> · {article.authorRole}
                    </p>

                    {/* Title */}
                    <h4 className="text-base font-bold text-[#1D1F22] leading-snug group-hover:text-[#E3202B] transition-colors">
                      {article.title}
                    </h4>

                    {/* Excerpt */}
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                      {article.content}
                    </p>
                  </div>

                  {/* Card Footer: Read Link & Bookmark */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-xs font-bold text-[#E3202B] group-hover:underline flex items-center gap-1">
                      <span>Read article</span>
                      <span>→</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article.id, article.title);
                      }}
                      title="Bookmark article"
                      className="text-slate-400 hover:text-[#E3202B] transition-colors p-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? "#E3202B" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No published articles found"
            description={
              searchQuery || selectedCategory !== "All"
                ? "No articles matched your filter criteria. Try clearing search or resetting category."
                : "No peer-reviewed articles currently published in the database. Clinical articles published by verified doctors will appear here."
            }
            actionText={
              searchQuery || selectedCategory !== "All"
                ? "Reset Filters"
                : "Browse Verified Doctors"
            }
            actionHref={
              searchQuery || selectedCategory !== "All"
                ? undefined
                : "/doctors"
            }
            onActionClick={
              searchQuery || selectedCategory !== "All"
                ? () => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }
                : undefined
            }
          />
        )}
      </main>

      {/* ============ ARTICLE READER MODAL OVERLAY ============ */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#E3202B] border border-rose-200">
                {activeArticle.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1D1F22] flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D1F22] leading-snug">
                {activeArticle.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#64748B]">
                <span>
                  By <strong className="text-[#1D1F22]">{activeArticle.authorName}</strong> ({activeArticle.authorRole}) · {activeArticle.readTime} read
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#475569] leading-relaxed pt-2 border-t border-slate-100 whitespace-pre-line">
              {activeArticle.content}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  toggleBookmark(activeArticle.id, activeArticle.title);
                }}
                className="text-xs font-semibold text-[#E3202B] hover:underline cursor-pointer"
              >
                {bookmarks[activeArticle.id] ? "Saved in bookmarks ✓" : "+ Add to reading list"}
              </button>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-full bg-[#1D1F22] text-white text-xs font-semibold hover:bg-black cursor-pointer"
              >
                Close reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SHARE STORY SUBMISSION MODAL ============ */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#1D1F22]">Contribute Article or Case Insight</h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#1D1F22] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShareStorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1F22]">Article Title</label>
                <input
                  type="text"
                  required
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="e.g. Managing Glycemic Index with Indian Whole Foods"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#1D1F22] focus:bg-white focus:outline-hidden focus:border-[#E3202B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1D1F22]">Article Content</label>
                <textarea
                  rows={5}
                  required
                  value={newStoryQuote}
                  onChange={(e) => setNewStoryQuote(e.target.value)}
                  placeholder="Write clinical or nutritional guidance, citations, or case observations..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#1D1F22] focus:bg-white focus:outline-hidden focus:border-[#E3202B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#E3202B] text-white hover:bg-[#c91822] shadow-xs cursor-pointer"
                >
                  Submit for moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D1F22] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
