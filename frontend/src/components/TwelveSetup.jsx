import {useState} from 'react';

export default function TwelveSetup() {
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function check() {
    setBusy(true);setMessage('Memeriksa Twelve Data…');
    try {
      const response=await fetch('/api/twelve?timeframe=1h',{signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok||!result.success) throw new Error(result.error||'Koneksi belum berhasil.');
      setMessage(`Terhubung · ${result.data?.length||0} candle XAU/USD diterima. Kesegaran harga mengikuti waktu data penyedia.`);
    } catch(error) {
      setMessage(error.message?.includes('401')?'Kunci ditolak Twelve Data (401). Periksa atau ganti kunci di Vercel, lalu redeploy.':error.name==='TimeoutError'?'Pemeriksaan melewati batas waktu. Coba kembali.':error.message||'Koneksi belum berhasil.');
    } finally {setBusy(false);}
  }
  return <details className="rounded-xl border border-cyan-800 bg-slate-900 p-4 text-slate-200" open>
    <summary className="cursor-pointer font-semibold text-cyan-200">Pengaturan API · Twelve Data / Vercel</summary>
    <p className="mt-3 text-sm">Pasang kunci di dashboard Vercel milikmu. Pengaturan ini tidak menyimpan kunci di browser.</p>
    <ol className="list-decimal pl-5 mt-3 space-y-2 text-sm">
      <li>Buka Vercel dan pilih proyek aplikasi ini.</li>
      <li>Pilih <strong>Settings → Environment Variables → Add Environment Variable</strong>.</li>
      <li>Isi Key: <code className="text-cyan-200 break-all">TWELVEDATA_API_KEY</code>, lalu isi Value dengan API key Twelve Data.</li>
      <li>Pilih <strong>Production</strong>; pilih juga Preview bila dipakai. Simpan.</li>
      <li>Buka <strong>Deployments → ⋯ → Redeploy</strong>. Tunggu selesai, lalu periksa koneksi di sini.</li>
    </ol>
    <div className="flex flex-wrap gap-2 mt-4">
      <a className="chart-toggle" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Buka Vercel ↗</a>
      <button type="button" className="chart-toggle" disabled={busy} onClick={check}>{busy?'Memeriksa…':'Periksa Twelve Data'}</button>
    </div>
    <p role="status" className="text-sm mt-3 text-amber-200">{message}</p>
    <p className="text-xs text-slate-400 mt-2">Lokal: gunakan backend/.env dan mulai ulang server. Pengaturan lokal dan Vercel terpisah. Pemeriksaan memakai kuota API.</p>
  </details>;
}
