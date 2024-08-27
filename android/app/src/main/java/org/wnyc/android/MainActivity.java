package org.wnyc.android;

import android.content.Context;
import android.os.Bundle;
import android.util.AttributeSet;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.CapacitorWebView;
//import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize the WebView after the bridge is ready
        WebView webView = getBridge().getWebView();

        // Apply custom settings to the WebView
        WebSettings settings = webView.getSettings();

        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        settings.setTextZoom(100); // Set text zoom level
        // Let the web view use JavaScript.
        settings.setJavaScriptEnabled(true);
        // Let the web view access local storage.
        settings.setDomStorageEnabled(true);
        // Let HTML videos play automatically.
        settings.setMediaPlaybackRequiresUserGesture(false);

        //MobileAds.registerWebView(webView);
        //webView.loadUrl("https://webview-api-for-ads-test.glitch.me#webview-settings-tests");

    }

    // Removed @Override annotation and returning null
    protected CapacitorWebView createWebView(Context context, AttributeSet attrs) {
        // Implement this method properly or remove it if not needed
        return null; // Consider implementing this method or removing it
    }
}
