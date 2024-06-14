package org.wnyc.android;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize the WebView after the bridge is ready
        WebView webView = getBridge().getWebView();

        // Apply custom settings to the WebView
        WebSettings settings = webView.getSettings();
        settings.setTextZoom(100); // Set text zoom level
    }
}