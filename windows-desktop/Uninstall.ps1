Add-Type -AssemblyName System.Windows.Forms
$target = [IO.Path]::GetFullPath($PSScriptRoot)
$expected = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Programs\COPTAH'))
if ($target -ne $expected) { throw 'Lokasi instalasi tidak sesuai. Tidak ada berkas yang dihapus.' }
$running = $null
if ([Threading.Mutex]::TryOpenExisting('Local\COPTAHDesktop', [ref]$running)) {
    $running.Dispose()
    [Windows.Forms.MessageBox]::Show('Tutup COP TAH melalui ikon area notifikasi sebelum menghapus aplikasi.', 'COP TAH masih berjalan') | Out-Null
    exit 1
}
if ([Windows.Forms.MessageBox]::Show('Hapus aplikasi COP TAH? Tutup aplikasi terlebih dahulu. Terminal MT5 dan data akun tidak dihapus.', 'COP TAH', 'YesNo') -ne 'Yes') { exit }
$desktopLink = Join-Path ([Environment]::GetFolderPath('DesktopDirectory')) 'COP TAH.lnk'
$startLink = Join-Path ([Environment]::GetFolderPath('Programs')) 'COP TAH\COP TAH.lnk'
foreach ($link in @($desktopLink, $startLink)) { if (Test-Path -LiteralPath $link) { Remove-Item -LiteralPath $link } }
Remove-Item -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\COPTAH' -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
[Windows.Forms.MessageBox]::Show('Aplikasi sudah dihapus. Log tetap tersedia di folder LocalAppData\COPTAH\logs.', 'COP TAH') | Out-Null
