import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = {failed:false,message:'',stack:''};
  static getDerivedStateFromError(error) {return {failed:true,message:error?.message||String(error),stack:error?.stack||''};}
  componentDidCatch(error) {console.error('Aplikasi gagal dirender:',error);}
  render() {
    if(!this.state.failed) return this.props.children;
    return <main style={{minHeight:'100vh',background:'#0e1621',color:'#e2e8f0',padding:'32px 20px',fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:24}}>COP TAH · Tampilan belum berhasil dimuat</h1>
      <p>Terjadi kesalahan saat membuka tampilan. Muat ulang aplikasi untuk mencoba kembali.</p>
      <button onClick={()=>window.location.reload()} style={{padding:'12px 20px',marginTop:16,background:'#eab54f',color:'#111',border:0,borderRadius:10}}>Muat ulang</button>
      <button onClick={()=>this.setState({failed:false,message:'',stack:''})} style={{padding:'12px 20px',margin:'16px',background:'#203b52',color:'#e2f3ff',border:'1px solid #6a8ca7',borderRadius:10}}>Coba buka kembali</button>
      <details open style={{marginTop:20,maxWidth:900,padding:16,background:'#16273b',border:'1px solid #46647e',borderRadius:8}}><summary>Rincian kesalahan</summary><p style={{color:'#ffcc99',overflowWrap:'anywhere'}}>{this.state.message}</p><pre style={{whiteSpace:'pre-wrap',fontSize:11,overflowWrap:'anywhere'}}>{this.state.stack}</pre></details>
      <p>Salin baris pertama rincian kesalahan di atas agar sumber masalah dapat diperbaiki tepat.</p>
    </main>;
  }
}
