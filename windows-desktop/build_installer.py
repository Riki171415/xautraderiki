"""Build a Windows x64 installer using installed runtimes; no account/config files."""
from pathlib import Path
import datetime
import importlib.metadata
import json
import os
import shutil
import subprocess
import sys
import zipfile
import hashlib

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'windows-desktop'/'build'/datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
STAGE=BUILD/'app'
OUT=ROOT/'installers'/'COP-TAH-Windows-x64-Setup.exe'
VERSION='1.3.0'
CSC=Path(os.environ['WINDIR'])/'Microsoft.NET'/'Framework64'/'v4.0.30319'/'csc.exe'

def run(args,**kwargs):
    subprocess.run([str(a) for a in args],check=True,**kwargs)

def copy(src,dst):
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)

def main():
    if sys.platform!='win32' or sys.maxsize<=2**32:raise RuntimeError('Build requires Windows x64 Python.')
    if not CSC.exists():raise RuntimeError('.NET Framework compiler unavailable.')
    if sys.version_info[:2]!=(3,11):raise RuntimeError('This runtime layout requires Python 3.11 x64.')
    BUILD.mkdir(parents=True)
    STAGE.mkdir()
    run(['npm.cmd','--prefix','frontend','run','build'],cwd=ROOT)
    node=Path(shutil.which('node'))
    copy(node,STAGE/'runtime'/'node.exe')
    copy(ROOT/'windows-desktop'/'NODE-LICENSE.txt',STAGE/'runtime'/'NODE-LICENSE.txt')
    # Node's binary embeds its third-party license text.
    license_text=subprocess.check_output([str(node),'-p','process.release.name+" "+process.version'],text=True)
    (STAGE/'runtime'/'NODE-RUNTIME.txt').write_text(license_text+'\nNode.js license: https://github.com/nodejs/node/blob/'+subprocess.check_output([str(node),'--version'],text=True).strip()+'/LICENSE\n',encoding='utf-8')
    copy(ROOT/'exness_mt5_bridge.py',STAGE/'exness_mt5_bridge.py')
    for f in (ROOT/'backend').glob('*.js'):
        if not f.name.endswith('.test.js'):copy(f,STAGE/'backend'/f.name)
    copy(ROOT/'backend'/'package.json',STAGE/'backend'/'package.json')
    # The server no longer depends on the retired API route.
    shutil.copytree(ROOT/'frontend'/'dist',STAGE/'frontend'/'dist')
    paths=subprocess.check_output(['npm.cmd','--prefix','backend','ls','--omit=dev','--all','--parseable'],cwd=ROOT,text=True).splitlines()
    modules=ROOT/'backend'/'node_modules'
    roots=[]
    for value in paths:
        path=Path(value)
        if path==ROOT/'backend' or not path.is_dir():continue
        if any(parent==path or parent in path.parents for parent in roots):continue
        roots.append(path)
        shutil.copytree(path,STAGE/'backend'/'node_modules'/path.relative_to(modules),ignore=shutil.ignore_patterns('*.map','__pycache__','.cache'))
    py=Path(sys.base_prefix)
    pyout=STAGE/'runtime'/'python'
    pyout.mkdir(parents=True)
    for name in ['python.exe','pythonw.exe','python3.dll','python311.dll','vcruntime140.dll','vcruntime140_1.dll','LICENSE.txt']:
        if (py/name).exists():copy(py/name,pyout/name)
    shutil.copytree(py/'DLLs',pyout/'DLLs',ignore=shutil.ignore_patterns('*tk*','*tcl*','_test*','*.ico'))
    with zipfile.ZipFile(pyout/'python311.zip','w',zipfile.ZIP_DEFLATED) as archive:
        for file in (py/'Lib').rglob('*.py'):
            rel=file.relative_to(py/'Lib')
            if set(rel.parts)&{'site-packages','test','tests','idlelib','tkinter','ensurepip','__pycache__'}:continue
            archive.write(file,str(rel))
    # Explicit distributions only; never copy the user's Python profiles or credentials.
    for name in ['MetaTrader5','numpy','requests','certifi','charset-normalizer','idna','urllib3']:
        dist=importlib.metadata.distribution(name)
        for rel in dist.files or []:
            if '..' in rel.parts or '__pycache__' in rel.parts:continue
            source=Path(dist.locate_file(rel))
            if source.is_file():copy(source,pyout/'Lib'/'site-packages'/str(rel))
    # Validate the self-contained interpreter without user site packages/PATH imports.
    env={**os.environ,'PYTHONHOME':str(pyout),'PYTHONNOUSERSITE':'1'}
    run([pyout/'python.exe','-c','import MetaTrader5,numpy,requests,ssl; print("Bundled Python imports OK")'],cwd=STAGE,env=env)
    run([STAGE/'runtime'/'node.exe','--check',STAGE/'backend'/'server.js'],cwd=STAGE)
    copy(ROOT/'windows-desktop'/'Uninstall.ps1',STAGE/'Uninstall.ps1')
    copy(ROOT/'windows-desktop'/'PANDUAN-WINDOWS.txt',STAGE/'PANDUAN-WINDOWS.txt')
    copy(ROOT/'PANDUAN_APLIKASI.md',STAGE/'PANDUAN_APLIKASI.md')
    copy(ROOT/'docs'/'PERBAIKAN_SUPPORT_UJI_10_TAHUN.md',STAGE/'docs'/'PERBAIKAN_SUPPORT_UJI_10_TAHUN.md')
    for name in ['LOGIKA_PUZZLE_COPTAH.md','UJI_HISTORIS_PUZZLE.md','RILIS_1.3.0.md']:
        copy(ROOT/'docs'/name,STAGE/'docs'/name)
    release_files=[STAGE/'backend'/'server.js',STAGE/'backend'/'rule_engine.js',STAGE/'backend'/'mt5_positions.js',STAGE/'backend'/'market_habits.js',STAGE/'backend'/'market_cycle.js',STAGE/'backend'/'mt5_data.js',STAGE/'backend'/'reference_analysis.js',STAGE/'exness_mt5_bridge.py',*sorted((STAGE/'frontend'/'dist').rglob('*'))]
    content_hashes={f.relative_to(STAGE).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in release_files if f.is_file()}
    (STAGE/'build-info.json').write_text(json.dumps({'version':VERSION,'builtAt':datetime.datetime.now().isoformat(),'contentSha256':content_hashes},indent=2),encoding='utf-8')
    run([CSC,'/nologo','/target:winexe','/platform:x64','/out:'+str(STAGE/'COPTAH.exe'),'/r:System.Windows.Forms.dll','/r:System.Drawing.dll',ROOT/'windows-desktop'/'Launcher.cs'])
    result=subprocess.run([str(STAGE/'COPTAH.exe'),'--check'])
    if result.returncode:raise RuntimeError('Launcher package check failed.')
    # Refuse sensitive paths and secret assignments in the release manifest.
    files=[f for f in STAGE.rglob('*') if f.is_file()]
    for file in files:
        if file.name.startswith('.env') or '.git' in file.relative_to(STAGE).parts or file.suffix=='.log':
            raise RuntimeError('Sensitive path in installer: '+str(file.relative_to(STAGE)))
    payload=BUILD/'payload.zip'
    with zipfile.ZipFile(payload,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for file in files:archive.write(file,str(file.relative_to(STAGE)))
    OUT.parent.mkdir(exist_ok=True)
    run([CSC,'/nologo','/target:winexe','/platform:x64','/out:'+str(OUT),'/resource:'+str(payload)+',payload.zip','/r:System.Windows.Forms.dll','/r:System.Drawing.dll','/r:System.IO.Compression.dll','/r:System.IO.Compression.FileSystem.dll','/r:Microsoft.CSharp.dll',ROOT/'windows-desktop'/'Setup.cs'])
    run([OUT,'--verify'])
    digest=hashlib.sha256(OUT.read_bytes()).hexdigest()
    (OUT.with_suffix('.sha256')).write_text(digest+'  '+OUT.name+'\n',encoding='utf-8')
    manifest={'version':VERSION,'builtAt':datetime.datetime.now().isoformat(),'files':len(files),'sizeBytes':OUT.stat().st_size,'sha256':digest,'node':subprocess.check_output([str(node),'--version'],text=True).strip(),'python':sys.version.split()[0],'sources':['EXNESS','BINANCE'],'contentSha256':content_hashes}
    (ROOT/'installers'/'COP-TAH-Windows-build.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('Installer:',OUT)
    print('Size MB:',round(OUT.stat().st_size/1024**2,1))
    print('SHA256:',digest)

if __name__=='__main__':main()
