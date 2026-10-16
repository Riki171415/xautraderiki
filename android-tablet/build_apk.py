"""Build and sign the tablet APK with the local official Android toolchain."""
from pathlib import Path
import os, subprocess, zipfile
ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / '.android-tools'
JAVA = next((TOOLS / 'jdk').glob('*/bin'))
BUILD_TOOLS = next((TOOLS / 'build-tools').glob('*/aapt2.exe')).parent
PLATFORM = next((TOOLS / 'platform').glob('*/android.jar'))
BUILD = ROOT / 'android-tablet/build'
KEYS = ROOT / 'android-tablet/keys'
OUT = ROOT / 'installers/COP-TAH-Exness-Tablet.apk'
for folder in [BUILD / 'classes', BUILD / 'dex', KEYS, OUT.parent]: folder.mkdir(parents=True, exist_ok=True)
def run(*args):
    subprocess.run([str(a) for a in args], check=True, cwd=ROOT)
run(BUILD_TOOLS / 'aapt2.exe', 'compile', '--dir', ROOT / 'android-tablet/res', '-o', BUILD / 'resources.zip')
run(BUILD_TOOLS / 'aapt2.exe', 'link', '-o', BUILD / 'unsigned.apk', '--manifest', ROOT / 'android-tablet/AndroidManifest.xml', '-I', PLATFORM, BUILD / 'resources.zip')
sources = list((ROOT / 'android-tablet/src').rglob('*.java'))
run(JAVA / 'javac.exe', '-encoding', 'UTF-8', '--release', '8', '-classpath', PLATFORM, '-d', BUILD / 'classes', *sources)
with zipfile.ZipFile(BUILD / 'classes.jar', 'w', compression=zipfile.ZIP_DEFLATED) as jar:
    for file in (BUILD / 'classes').rglob('*.class'):
        jar.write(file, file.relative_to(BUILD / 'classes'))
run(JAVA / 'java.exe', '-cp', BUILD_TOOLS / 'lib/d8.jar', 'com.android.tools.r8.D8', '--lib', PLATFORM, '--min-api', '26', '--output', BUILD / 'dex', BUILD / 'classes.jar')
with zipfile.ZipFile(BUILD / 'unsigned.apk', 'a', compression=zipfile.ZIP_DEFLATED) as apk:
    apk.write(BUILD / 'dex/classes.dex', 'classes.dex')
run(BUILD_TOOLS / 'zipalign.exe', '-f', '4', BUILD / 'unsigned.apk', BUILD / 'aligned.apk')
# Local personal distribution key; private key and password stay outside source control.
keyfile = KEYS / 'tablet.p12'
passfile = KEYS / 'password.txt'
if not keyfile.exists():
    import secrets
    passfile.write_text(secrets.token_urlsafe(32), encoding='ascii')
    run(JAVA / 'keytool.exe', '-genkeypair', '-keystore', keyfile, '-storetype', 'PKCS12', '-storepass:file', passfile, '-alias', 'coptah-tablet', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=COP TAH Personal Tablet')
run(JAVA / 'java.exe', '-jar', BUILD_TOOLS / 'lib/apksigner.jar', 'sign', '--ks', keyfile, '--ks-pass', 'file:' + str(passfile), '--out', OUT, BUILD / 'aligned.apk')
run(JAVA / 'java.exe', '-jar', BUILD_TOOLS / 'lib/apksigner.jar', 'verify', '--verbose', OUT)
run(BUILD_TOOLS / 'aapt.exe', 'dump', 'badging', OUT)
print('APK ready:', OUT)
