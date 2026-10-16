package id.coptah.tablet;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.net.URI;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView web;
    private String server;
    private TextView status;
    private final int bg = Color.rgb(7,10,19);
    private final int fg = Color.rgb(226,232,240);
    private int dp(int n) { return (int)(n * getResources().getDisplayMetrics().density); }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
        server = getPreferences(MODE_PRIVATE).getString("server", "");
        if (server.isEmpty()) showSetup(); else showDashboard();
    }

    private LinearLayout root() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);
        root.setPadding(dp(16),dp(12),dp(16),dp(12));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int top = insets.getSystemWindowInsetTop();
            int bottom = insets.getSystemWindowInsetBottom();
            v.setPadding(dp(16), top + dp(12), dp(16), bottom + dp(12));
            return insets;
        });
        setContentView(root);
        return root;
    }
    private TextView text(String value, int size) {
        TextView t = new TextView(this);
        t.setText(value); t.setTextSize(size); t.setTextColor(fg);
        t.setPadding(0,dp(8),0,dp(8));
        return t;
    }
    private Button button(String label) {
        Button b = new Button(this); b.setText(label); b.setAllCaps(false);
        b.setTextColor(fg); b.setMinHeight(dp(48)); return b;
    }
    private void showSetup() {
        if (web != null) { web.destroy(); web = null; }
        LinearLayout root = root();
        root.addView(text("COP TAH / EXNESS", 14));
        root.addView(text("Hubungkan dashboard", 28));
        root.addView(text("Pantau harga dari MT5 komputer melalui Wi-Fi atau internet HP. MT5 komputer dan bridge harus tetap menyala.", 16));
        root.addView(text("Alamat server dashboard", 14));
        EditText input = new EditText(this);
        input.setSingleLine(true); input.setTextColor(fg);
        input.setHintTextColor(Color.LTGRAY);
        input.setHint("https://alamat-dashboard-anda");
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        input.setText(server);
        root.addView(input, new LinearLayout.LayoutParams(-1, dp(56)));
        TextView error = text("", 14); error.setTextColor(Color.rgb(251,191,36)); root.addView(error);
        Button connect = button("Simpan dan buka dashboard"); root.addView(connect);
        connect.setOnClickListener(v -> {
            String value = input.getText().toString().trim();
            if (!validAddress(value)) {
                error.setText("Masukkan alamat HTTPS, atau alamat privat Wi-Fi/Tailscale. localhost bukan alamat komputer dari tablet.");
                return;
            }
            server = value.endsWith("/") ? value : value + "/";
            getPreferences(MODE_PRIVATE).edit().putString("server", server).apply();
            showDashboard();
        });
        root.addView(text("Untuk internet HP: gunakan alamat HTTPS atau jaringan privat Tailscale yang menghubungkan tablet dengan komputer. Mengisi alamat Wi-Fi saja tidak cukup untuk akses dari luar rumah.", 14));
        root.addView(text("MT5 Android tidak menjadi sumber bridge. Aplikasi ini tidak meminta password akun trading.", 14));
    }
    static boolean validAddress(String value) {
        try {
            URI u = new URI(value);
            String host = u.getHost();
            if (host == null || u.getUserInfo() != null || u.getQuery() != null || u.getFragment() != null) return false;
            host = host.toLowerCase(Locale.ROOT);
            if (host.equals("localhost") || host.equals("::1") || host.startsWith("127.")) return false;
            if ("https".equals(u.getScheme())) return true;
            if (!"http".equals(u.getScheme())) return false;
            if (host.endsWith(".ts.net")) return true;
            String[] parts = host.split("\\.");
            if (parts.length != 4) return false;
            int[] ip = new int[4];
            for (int i=0;i<4;i++) { ip[i]=Integer.parseInt(parts[i]); if(ip[i]<0 || ip[i]>255) return false; }
            return ip[0]==10 || (ip[0]==192 && ip[1]==168) ||
                (ip[0]==172 && ip[1]>=16 && ip[1]<=31) ||
                (ip[0]==100 && ip[1]>=64 && ip[1]<=127);
        } catch (Exception e) { return false; }
    }
    private boolean sameOrigin(Uri uri) {
        Uri base = Uri.parse(server);
        return base.getScheme().equals(uri.getScheme()) && base.getHost().equals(uri.getHost()) && base.getPort()==uri.getPort();
    }
    private void showDashboard() {
        LinearLayout root = root();
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        status = text("COP TAH · menghubungkan", 13);
        bar.addView(status, new LinearLayout.LayoutParams(0,-2,1));
        Button refresh = button("Muat ulang"); bar.addView(refresh);
        Button setup = button("Koneksi"); bar.addView(setup);
        root.addView(bar);
        web = new WebView(this);
        web.setBackgroundColor(bg);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                if (sameOrigin(uri)) return false;
                if ("https".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); } catch(Exception ignored) {}
                }
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                status.setText("COP TAH · " + Uri.parse(server).getHost());
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Server belum dapat diakses")
                    .setMessage("Pastikan komputer MT5 menyala, bridge aktif, dan alamat server dapat diakses dari jaringan tablet. Untuk internet HP, aktifkan jaringan privat atau gunakan alamat HTTPS server.")
                    .setPositiveButton("Coba lagi",(d,w)->web.loadUrl(server))
                    .setNegativeButton("Atur koneksi",(d,w)->showSetup()).show();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                status.setText("Sertifikat HTTPS tidak valid");
            }
        });
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        refresh.setOnClickListener(v->web.reload());
        setup.setOnClickListener(v->showSetup());
        web.loadUrl(server);
    }
    @Override public void onBackPressed() {
        if(web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() { if(web!=null) web.destroy(); super.onDestroy(); }
}
