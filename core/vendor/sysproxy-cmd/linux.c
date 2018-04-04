#include <gio/gio.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "common.h"

void init() {
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
  // deprecated since version 2.36, must leave here or prior glib will crash
  g_type_init();
#pragma GCC diagnostic warning "-Wdeprecated-declarations"
}

int show()
{
  init();
  GSettings* setting = g_settings_new("org.gnome.system.proxy");
  GSettings* httpSetting = g_settings_new("org.gnome.system.proxy.http");
  char* oldMode = g_settings_get_string(setting, "mode");
  gboolean oldEnabled = g_settings_get_boolean(httpSetting, "enabled");
  char* oldHost = g_settings_get_string(httpSetting, "host");
  gint oldPort = g_settings_get_int(httpSetting, "port");
  if (oldEnabled && strcmp(oldMode, "manual") == 0) {
    printf("%s:%d\n", oldHost, oldPort);
  }
  return RET_NO_ERROR;
}

int toggleProxy(bool turnOn)
{
  long port = strtol(proxyPort, NULL, 10);
  if (port == 0) {
    fprintf(stderr, "unable to parse port '%s'\n", proxyPort);
    return INVALID_FORMAT;
  }

  int ret = RET_NO_ERROR;
  init();
  GSettings* setting = g_settings_new("org.gnome.system.proxy");
  GSettings* httpSetting = g_settings_new("org.gnome.system.proxy.http");
  GSettings* httpsSetting = g_settings_new("org.gnome.system.proxy.https");
  if (turnOn == true) {
    gboolean success = g_settings_set_string(httpSetting, "host", proxyHost);
    if (!success) {
      fprintf(stderr, "error setting http host to %s\n", proxyHost);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_int(httpSetting, "port", port);
    if (!success) {
      fprintf(stderr, "error setting http port %s\n", proxyPort);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_string(httpsSetting, "host", proxyHost);
    if (!success) {
      fprintf(stderr, "error setting https host to %s\n", proxyHost);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_int(httpsSetting, "port", port);
    if (!success) {
      fprintf(stderr, "error setting https port %s\n", proxyPort);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_boolean(httpSetting, "enabled", TRUE);
    if (!success) {
      fprintf(stderr, "error enabling http %s\n", proxyPort);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_string(setting, "mode", "manual");
    if (!success) {
      fprintf(stderr, "error setting mode to manual\n");
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
  }
  else {
    if (strlen(proxyHost) != 0) {
      // clear proxy setting only if it's equal to the original setting
      char* oldMode = g_settings_get_string(setting, "mode");
      char* oldHTTPHost = g_settings_get_string(httpSetting, "host");
      long oldHTTPPort = g_settings_get_int(httpSetting, "port");
      char* oldHTTPSHost = g_settings_get_string(httpsSetting, "host");
      long oldHTTPSPort = g_settings_get_int(httpsSetting, "port");
      if (strcmp(oldMode, "manual") != 0 ||
          strcmp(oldHTTPHost, proxyHost) != 0 ||
          oldHTTPPort != port ||
          strcmp(oldHTTPSHost, proxyHost) != 0 ||
          oldHTTPSPort != port) {
	      fprintf(stderr, "current http or https setting is not %s:%s, skipping\n", proxyHost, proxyPort);
        goto cleanup;
      }
    }
    g_settings_reset(httpSetting, "host");
    g_settings_reset(httpSetting, "port");
    g_settings_reset(httpsSetting, "host");
    g_settings_reset(httpsSetting, "port");
    g_settings_reset(httpSetting, "enabled");
    g_settings_reset(setting, "mode");
  }

cleanup:
  g_settings_sync();
  g_object_unref(setting);

  return ret;
}
