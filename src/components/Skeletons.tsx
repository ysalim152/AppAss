import React from "react";
import { AppTheme } from "../types";

interface SkeletonProps {
  theme?: AppTheme;
}

export function BaseSkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`} />
  );
}

// 1. DASHBOARD SKELETON
export function DashboardSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner Skeleton */}
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <BaseSkeletonBlock className="h-7 w-64" />
            <BaseSkeletonBlock className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2">
            <BaseSkeletonBlock className="h-10 w-28 rounded-xl" />
            <BaseSkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-5 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
            <div className="flex items-center justify-between">
              <BaseSkeletonBlock className="h-4 w-24" />
              <BaseSkeletonBlock className="h-9 w-9 rounded-2xl" />
            </div>
            <BaseSkeletonBlock className="h-8 w-20" />
            <BaseSkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
          <div className="flex items-center justify-between">
            <BaseSkeletonBlock className="h-5 w-48" />
            <BaseSkeletonBlock className="h-8 w-24 rounded-lg" />
          </div>
          <BaseSkeletonBlock className="h-64 w-full rounded-2xl" />
        </div>

        <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
          <BaseSkeletonBlock className="h-5 w-36" />
          <BaseSkeletonBlock className="h-48 w-48 rounded-full mx-auto" />
          <div className="space-y-2 pt-2">
            <BaseSkeletonBlock className="h-4 w-full" />
            <BaseSkeletonBlock className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <BaseSkeletonBlock className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <BaseSkeletonBlock className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <BaseSkeletonBlock className="h-4 w-40" />
                  <BaseSkeletonBlock className="h-3 w-28" />
                </div>
              </div>
              <BaseSkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. MEMBERS SKELETON
export function MembersSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <BaseSkeletonBlock className="h-7 w-56" />
            <BaseSkeletonBlock className="h-4 w-80 max-w-full" />
          </div>
          <BaseSkeletonBlock className="h-10 w-40 rounded-xl shrink-0" />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <BaseSkeletonBlock className="h-10 w-64 rounded-xl flex-1" />
          <BaseSkeletonBlock className="h-10 w-36 rounded-xl" />
          <BaseSkeletonBlock className="h-10 w-36 rounded-xl" />
          <BaseSkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <BaseSkeletonBlock className="h-4 w-32" />
          <BaseSkeletonBlock className="h-4 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <BaseSkeletonBlock className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <BaseSkeletonBlock className="h-4 w-36" />
                  <BaseSkeletonBlock className="h-3 w-48" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <BaseSkeletonBlock className="h-6 w-20 rounded-full" />
                <BaseSkeletonBlock className="h-6 w-24 rounded-full" />
                <BaseSkeletonBlock className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. TEAMS SKELETON
export function TeamsSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} flex items-center justify-between gap-4`}>
        <div className="space-y-2">
          <BaseSkeletonBlock className="h-7 w-48" />
          <BaseSkeletonBlock className="h-4 w-72" />
        </div>
        <BaseSkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
            <div className="flex items-center justify-between">
              <BaseSkeletonBlock className="h-6 w-32" />
              <BaseSkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
            <BaseSkeletonBlock className="h-4 w-48" />
            <div className="flex items-center gap-2 pt-2">
              {[1, 2, 3, 4].map((avatar) => (
                <BaseSkeletonBlock key={avatar} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900" />
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <BaseSkeletonBlock className="h-3 w-20" />
              <BaseSkeletonBlock className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. FINANCES SKELETON
export function FinancesSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <BaseSkeletonBlock className="h-7 w-52" />
            <BaseSkeletonBlock className="h-4 w-80" />
          </div>
          <BaseSkeletonBlock className="h-10 w-44 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-5 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
            <BaseSkeletonBlock className="h-4 w-28" />
            <BaseSkeletonBlock className="h-8 w-32" />
            <BaseSkeletonBlock className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <BaseSkeletonBlock className="h-6 w-44" />
        <BaseSkeletonBlock className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// 5. SESSIONS / PLANNING SKELETON
export function SessionsSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} flex items-center justify-between gap-4`}>
        <div className="space-y-2">
          <BaseSkeletonBlock className="h-7 w-48" />
          <BaseSkeletonBlock className="h-4 w-72" />
        </div>
        <BaseSkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-5 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
            <div className="flex justify-between items-center">
              <BaseSkeletonBlock className="h-6 w-24 rounded-full" />
              <BaseSkeletonBlock className="h-4 w-16" />
            </div>
            <BaseSkeletonBlock className="h-5 w-40" />
            <BaseSkeletonBlock className="h-4 w-32" />
            <div className="pt-2 flex gap-2">
              <BaseSkeletonBlock className="h-8 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. EQUIPMENT SKELETON
export function EquipmentSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} flex items-center justify-between gap-4`}>
        <div className="space-y-2">
          <BaseSkeletonBlock className="h-7 w-48" />
          <BaseSkeletonBlock className="h-4 w-72" />
        </div>
        <BaseSkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-5 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
            <div className="flex justify-between items-center">
              <BaseSkeletonBlock className="h-5 w-36" />
              <BaseSkeletonBlock className="h-6 w-12 rounded-full" />
            </div>
            <BaseSkeletonBlock className="h-4 w-28" />
            <BaseSkeletonBlock className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. BILAN SKELETON
export function BilanSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <BaseSkeletonBlock className="h-7 w-60" />
            <BaseSkeletonBlock className="h-4 w-80" />
          </div>
          <BaseSkeletonBlock className="h-10 w-48 rounded-xl" />
        </div>
        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pt-2 pb-1">
          <BaseSkeletonBlock className="h-8 w-36 rounded-lg" />
          <BaseSkeletonBlock className="h-8 w-44 rounded-lg" />
          <BaseSkeletonBlock className="h-8 w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-4 rounded-2xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-2`}>
            <BaseSkeletonBlock className="h-3 w-28" />
            <BaseSkeletonBlock className="h-7 w-20" />
            <BaseSkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-5 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
            <BaseSkeletonBlock className="h-5 w-48" />
            <BaseSkeletonBlock className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. GENERIC MODULE SKELETON
export function GenericSkeleton({ theme }: SkeletonProps) {
  const isClassic = theme === "classic";
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-3`}>
        <BaseSkeletonBlock className="h-7 w-48" />
        <BaseSkeletonBlock className="h-4 w-72" />
      </div>

      <div className={`p-6 rounded-3xl border ${isClassic ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xs"} space-y-4`}>
        <BaseSkeletonBlock className="h-6 w-36" />
        <BaseSkeletonBlock className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
