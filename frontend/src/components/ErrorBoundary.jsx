import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  componentDidCatch(error) {console.error('Aplikasi gagal dirender:',error);}
  render() {
    if(!this.state.failed) return this.props.children;
    return <main style={{minHeight:'100vh',background:'#0e1621',color:'#e2e8f0',padding:'32px 20px',fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:24}}>COP TAH · Tampilan belum berhasil dimuat</h1>
      <p>Terjadi kesalahan saat membuka tampilan. Muat ulang aplikasi untuk mencoba kembali.</p>
      <button onClick={()=>window.location.reload()} style={{padding:'12px 20px',marginTop:16,background:'#eab54f',color:'#111',border:0,borderRadius:10}}>Muat ulang</button>
      <p>Jika tetap terjadi, kirim nama browser dan halaman yang terakhir dibuka agar dapat diperiksa.</p>
    </main>;
  }
}
