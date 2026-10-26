import {useEffect,useState} from 'react';
import {API_BASE} from '../config';
export function useMt5Positions(selectedServer='',sourceSession){
 const [result,setResult]=useState({snapshot:null,error:null});
 useEffect(()=>{
  let disposed=false,running=false,controller;
  const poll=async()=>{
   if(running)return;running=true;controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),8000);
   try{
    const response=await fetch(`${API_BASE}/mt5/positions`,{signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw new Error(response.status===403?'Posisi akun hanya tersedia melalui aplikasi lokal MT5.':'Daftar posisi belum tersedia. Pastikan backend dan bridge versi terbaru berjalan.');
    const snapshot=await response.json();
    if(!snapshot.success)throw new Error(snapshot.error||'Daftar posisi belum tersedia.');
    if(!disposed)setResult({snapshot,error:null});
   }catch(error){if(!disposed)setResult({snapshot:null,error:error.name==='AbortError'?'Pembaruan posisi tertunda.':error.message});}
   finally{clearTimeout(timeout);running=false;}
  };
  poll();const timer=setInterval(poll,3000);
  return()=>{disposed=true;clearInterval(timer);controller?.abort();};
 },[selectedServer,sourceSession]);
 return result;
}
