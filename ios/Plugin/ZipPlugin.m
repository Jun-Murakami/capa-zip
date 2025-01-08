#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Declare the plugin class
CAP_PLUGIN(ZipPlugin, "Zip",
    CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(zip, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unzip, CAPPluginReturnPromise);
) 