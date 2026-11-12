package sa.youef.abtalalhuroof;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.speech.tts.TextToSpeech;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        web = new WebView(this);
        web.setBackgroundColor(0xff101f53);
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setDefaultTextEncodingName("UTF-8");
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new AudioBridge(), "AbtalNative");
        setContentView(web);
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override public void onInit(int status) { if (status == TextToSpeech.SUCCESS) tts.setLanguage(new Locale("ar", "SA")); }
        });
        web.loadUrl("file:///android_asset/index.html");
        web.requestFocus();
    }

    public final class AudioBridge {
        @JavascriptInterface public void speak(String phrase, String lang) {
            final String text = phrase == null ? "" : phrase;
            final String langCode = lang == null ? "ar" : lang;
            runOnUiThread(new Runnable() { @Override public void run() {
                if (tts != null) {
                    tts.setLanguage(langCode.equals("en") ? Locale.US : new Locale("ar", "SA"));
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null);
                }
            }});
        }
    }
    private boolean sendKey(int code) {
        switch(code) {
            case KeyEvent.KEYCODE_DPAD_UP: case KeyEvent.KEYCODE_DPAD_DOWN:
            case KeyEvent.KEYCODE_DPAD_LEFT: case KeyEvent.KEYCODE_DPAD_RIGHT:
            case KeyEvent.KEYCODE_DPAD_CENTER: case KeyEvent.KEYCODE_ENTER:
            case KeyEvent.KEYCODE_NUMPAD_ENTER: case KeyEvent.KEYCODE_BACK:
            case KeyEvent.KEYCODE_MENU: case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
                web.loadUrl("javascript:window.tvKey("+code+")");
                return true;
            default: return false;
        }
    }
    @Override public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (sendKey(keyCode)) return true;
        return super.onKeyDown(keyCode, event);
    }
    @Override public void onBackPressed() { web.loadUrl("javascript:window.nativeBack()"); }
    @Override public void onDestroy() { if (tts != null) { tts.stop(); tts.shutdown(); } if (web != null) web.destroy(); super.onDestroy(); }
}
