# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor / WebView rules - keep JS bridge classes
-keep class com.getcapacitor.** { *; }
-keep class com.icptuzla.tuzlatourguide.** { *; }

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep annotations used by Capacitor plugins
-keepattributes *Annotation*
-keepattributes JavascriptInterface

# Preserve line numbers for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
