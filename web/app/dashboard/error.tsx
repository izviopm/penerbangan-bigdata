"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-site px-4 py-16 md:px-8">
      <div role="alert" className="rounded-xl border border-border bg-card p-8">
        <h1 className="text-3xl font-extrabold text-foreground">Data dashboard gagal dimuat</h1>
        <p className="mt-2 text-muted-foreground">
          Koneksi ke Supabase sedang bermasalah, atau proyek Supabase sedang dijeda karena lama tidak dipakai. Coba lagi beberapa saat lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-primary px-5 font-semibold text-primary hover:bg-muted"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
