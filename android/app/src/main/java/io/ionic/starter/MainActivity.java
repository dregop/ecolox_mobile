package io.ionic.starter;
import com.getcapacitor.BridgeActivity;
import com.equimaps.capacitor_background_geolocation.BackgroundGeolocation;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(BackgroundGeolocation.class);
    }});
  }
}