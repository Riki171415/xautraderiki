using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyVersion("1.3.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.3.0.0")]
[assembly: System.Reflection.AssemblyProduct("COP TAH") ]

internal static class Launcher {
    static Process server;
    static IntPtr job;
    [STAThread] static int Main(string[] args) {
        string root=AppDomain.CurrentDomain.BaseDirectory;
        string node=Path.Combine(root,"runtime","node.exe");
        string python=Path.Combine(root,"runtime","python","python.exe");
        if(args.Length>0 && args[0]=="--check") {
            return File.Exists(node)&&File.Exists(python)&&File.Exists(Path.Combine(root,"frontend","dist","index.html"))?0:1;
        }
        bool created;
        using(var mutex=new Mutex(true,"Local\\COPTAHDesktop",out created)) {
            if(!created){MessageBox.Show("COP TAH sudah berjalan. Buka melalui ikon di area notifikasi Windows.","COP TAH");return 0;}
            Application.EnableVisualStyles();
            try {
                var listener=new TcpListener(IPAddress.Loopback,3001);
                try{listener.Start();}finally{listener.Stop();}
                var start=new ProcessStartInfo(node,"server.js");
                start.WorkingDirectory=Path.Combine(root,"backend");
                start.UseShellExecute=false;start.CreateNoWindow=true;
                start.EnvironmentVariables["COPTAH_PYTHON"]=python;
                start.EnvironmentVariables["COPTAH_HOST"]="127.0.0.1";
                start.EnvironmentVariables["PYTHONHOME"]=Path.GetDirectoryName(python);
                start.EnvironmentVariables["PYTHONNOUSERSITE"]="1";
                start.RedirectStandardOutput=true;start.RedirectStandardError=true;
                string logs=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"COPTAH","logs");
                Directory.CreateDirectory(logs);
                // A job closes only this launcher's process tree, including its MT5 bridge.
                job=CreateJobObject(IntPtr.Zero,null);
                var limits=new JobLimits();limits.Basic.LimitFlags=0x2000;
                if(job==IntPtr.Zero||!SetInformationJobObject(job,9,ref limits,(uint)Marshal.SizeOf(limits)))throw new Exception("Tidak dapat menyiapkan layanan latar belakang.");
                server=Process.Start(start);
                if(!AssignProcessToJobObject(job,server.Handle))throw new Exception("Tidak dapat mengelola layanan latar belakang.");
                server.OutputDataReceived+=(s,e)=>Log(logs,e.Data);
                server.ErrorDataReceived+=(s,e)=>Log(logs,e.Data);
                server.BeginOutputReadLine();server.BeginErrorReadLine();
                bool ready=false;
                for(int i=0;i<90&&!server.HasExited;i++) {
                    try {var req=WebRequest.Create("http://127.0.0.1:3001/api/health");req.Timeout=800;using(var res=req.GetResponse()){ready=true;break;}}catch{Thread.Sleep(500);}
                }
                if(!ready)throw new Exception("Server belum berhasil dibuka. Periksa log di "+logs);
                var menu=new ContextMenuStrip();
                menu.Items.Add("Buka COP TAH",null,(s,e)=>Open());
                menu.Items.Add("Panduan",null,(s,e)=>Process.Start(new ProcessStartInfo(Path.Combine(root,"PANDUAN-WINDOWS.txt")){UseShellExecute=true}));
                menu.Items.Add("Keluar dan hentikan layanan",null,(s,e)=>Application.ExitThread());
                using(var icon=new NotifyIcon()){icon.Icon=System.Drawing.SystemIcons.Application;icon.Text="COP TAH · Exness / Binance";icon.ContextMenuStrip=menu;icon.DoubleClick+=(s,e)=>Open();icon.Visible=true;Open();Application.Run();icon.Visible=false;}
                return 0;
            }catch(SocketException){MessageBox.Show("Port 3001 sedang dipakai. Tutup aplikasi COP TAH lain atau server pengembangan, lalu buka kembali.","COP TAH");return 1;}
             catch(Exception e){MessageBox.Show(e.Message,"COP TAH belum berhasil dibuka",MessageBoxButtons.OK,MessageBoxIcon.Error);return 1;}
             finally{if(job!=IntPtr.Zero)CloseHandle(job);if(server!=null){try{if(!server.HasExited)server.Kill();}catch{}server.Dispose();}}
        }
    }
    static void Open(){Process.Start(new ProcessStartInfo("http://127.0.0.1:3001/"){UseShellExecute=true});}
    static readonly object logLock=new object();
    static void Log(string dir,string line){if(line==null||line.Contains("Akun")||line.Contains("account"))return;try{lock(logLock)File.AppendAllText(Path.Combine(dir,"server.log"),DateTime.Now.ToString("s")+" "+line+Environment.NewLine);}catch{}}
    [StructLayout(LayoutKind.Sequential)] struct BasicLimits {public long ProcessTime,JobTime;public uint LimitFlags;public UIntPtr MinWorking,MaxWorking;public uint ActiveProcesses;public UIntPtr Affinity;public uint Priority,Scheduling;}
    [StructLayout(LayoutKind.Sequential)] struct IoCounters {public ulong A,B,C,D,E,F;}
    [StructLayout(LayoutKind.Sequential)] struct JobLimits {public BasicLimits Basic;public IoCounters Io;public UIntPtr ProcessMemory,JobMemory,PeakProcess,PeakJob;}
    [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr security,string name);
    [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr handle,int type,ref JobLimits info,uint length);
    [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr handle,IntPtr process);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
}
