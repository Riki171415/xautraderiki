using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyVersion("1.2.11.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.2.11.0")]
[assembly: System.Reflection.AssemblyProduct("COP TAH") ]

internal static class Setup {
 [STAThread] static int Main(string[] args){
  if(args.Length>0&&args[0]=="--verify"){
   try{
    using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))
    using(var zip=new ZipArchive(stream,ZipArchiveMode.Read)){
     foreach(string name in new[]{"COPTAH.exe","runtime/node.exe","runtime/python/python.exe","backend/server.js","frontend/dist/index.html","Uninstall.ps1"}){
      bool found=false;foreach(var entry in zip.Entries)if(entry.FullName.Replace('\\','/')==name){found=true;break;}if(!found)return 2;
     }
     foreach(var entry in zip.Entries){string name=entry.FullName.Replace('\\','/');if(name.StartsWith("/")||name.Contains("../")||name.Contains(":")||Path.GetFileName(name).StartsWith(".env"))return 3;}
    }
    return 0;
   }catch{return 4;}
  }
  Application.EnableVisualStyles();
  string target=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Programs","COPTAH");
  Mutex running;
  if(Mutex.TryOpenExisting("Local\\COPTAHDesktop",out running)){running.Dispose();MessageBox.Show("Tutup COP TAH lewat ikon area notifikasi (Keluar dan hentikan layanan), lalu jalankan installer kembali.","COP TAH masih berjalan");return 1;}
  if(!Environment.Is64BitOperatingSystem){MessageBox.Show("Paket ini memerlukan Windows 64-bit.","COP TAH");return 1;}
  if(MessageBox.Show("Pasang COP TAH untuk pengguna Windows ini?\n\nLokasi: "+target+"\n\nNode dan Python sudah disertakan. Untuk Exness, pasang MT5 dan login terlebih dahulu. Tutup COP TAH sebelum memperbarui instalasi.","Installer COP TAH",MessageBoxButtons.OKCancel,MessageBoxIcon.Information)!=DialogResult.OK)return 0;
  var progress=new Form{Text="Memasang COP TAH…",Width=430,Height=110,FormBorderStyle=FormBorderStyle.FixedDialog,ControlBox=false,StartPosition=FormStartPosition.CenterScreen};
  progress.Controls.Add(new Label{Text="Mengekstrak aplikasi. Mohon tunggu…",Dock=DockStyle.Fill,TextAlign=System.Drawing.ContentAlignment.MiddleCenter});progress.Show();Application.DoEvents();
  try {
   Directory.CreateDirectory(target);
   using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))
   using(var zip=new ZipArchive(stream,ZipArchiveMode.Read)){
    foreach(var entry in zip.Entries){
     string file=Path.GetFullPath(Path.Combine(target,entry.FullName.Replace('/',Path.DirectorySeparatorChar)));
     if(!file.StartsWith(Path.GetFullPath(target)+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase))throw new Exception("Jalur paket tidak valid.");
     if(entry.Name.Length==0){Directory.CreateDirectory(file);continue;}
     Directory.CreateDirectory(Path.GetDirectoryName(file));entry.ExtractToFile(file,true);
    }
   }
   Shortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"COP TAH.lnk"),target);
   string programs=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs),"COP TAH");Directory.CreateDirectory(programs);
   Shortcut(Path.Combine(programs,"COP TAH.lnk"),target);
   using(var key=Microsoft.Win32.Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\COPTAH")){
    key.SetValue("DisplayName","COP TAH · Exness dan Binance");key.SetValue("DisplayVersion","1.2.11");key.SetValue("Publisher","COP TAH");key.SetValue("InstallLocation",target);key.SetValue("DisplayIcon",Path.Combine(target,"COPTAH.exe"));
    key.SetValue("UninstallString","powershell.exe -NoProfile -ExecutionPolicy Bypass -File \""+Path.Combine(target,"Uninstall.ps1")+"\"");key.SetValue("NoModify",1);key.SetValue("NoRepair",1);
   }
   progress.Close();
   if(MessageBox.Show("COP TAH sudah terpasang.\nPintasan tersedia di Desktop dan Start Menu.\n\nBuka aplikasi sekarang?","Selesai",MessageBoxButtons.YesNo)==DialogResult.Yes)Process.Start(Path.Combine(target,"COPTAH.exe"));
   return 0;
  }catch(Exception e){progress.Close();MessageBox.Show("Pemasangan belum selesai: "+e.Message+"\nTutup COP TAH jika sedang berjalan, lalu coba kembali.","COP TAH");return 1;}
 }
 static void Shortcut(string file,string root){
  Type type=Type.GetTypeFromProgID("WScript.Shell");dynamic shell=Activator.CreateInstance(type);dynamic link=shell.CreateShortcut(file);
  link.TargetPath=Path.Combine(root,"COPTAH.exe");link.WorkingDirectory=root;link.Description="COP TAH · Exness MT5 / Binance Spot";link.Save();
 }
}
