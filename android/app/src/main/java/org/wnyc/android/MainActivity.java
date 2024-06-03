package org.wnyc.android;
import android.content.res.Configuration;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

   @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.custom_web_view);
        WebSettings settings = webView.getSettings();
        settings.setTextZoom(100);
    }
}
