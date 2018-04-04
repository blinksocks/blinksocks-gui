#include <gio/gio.h>
#include <stdio.h>
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
  char* old_mode = g_settings_get_string(setting, "mode");
  char* old_pac_url = g_settings_get_string(setting, "autoconfig-url");
  if (strcmp(old_mode, "auto") == 0) {
    printf("%s\n", old_pac_url);
  }
  return RET_NO_ERROR;
}

int togglePac(bool turnOn, const char* pacUrl)
{
  int ret = RET_NO_ERROR;
  init();
  GSettings* setting = g_settings_new("org.gnome.system.proxy");
  if (turnOn == true) {
    gboolean success = g_settings_set_string(setting, "mode", "auto");
    if (!success) {
      fprintf(stderr, "error setting mode to auto\n");
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
    success = g_settings_set_string(setting, "autoconfig-url", pacUrl);
    if (!success) {
      fprintf(stderr, "error setting autoconfig-url to %s\n", pacUrl);
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
  }
  else {
    if (strlen(pacUrl) != 0) {
      char* old_mode = g_settings_get_string(setting, "mode");
      char* old_pac_url = g_settings_get_string(setting, "autoconfig-url");
      // we turn pac off only if the option is set and pac url has the provided
      // prefix.
      if (strcmp(old_mode, "auto") != 0
          || strncmp(old_pac_url, pacUrl, strlen(pacUrl)) != 0 ) {
        fprintf(stderr, "current pac url setting is not %s, skipping\n", pacUrl);
        goto cleanup;
      }
    }
    g_settings_reset(setting, "autoconfig-url");
    gboolean success = g_settings_set_string(setting, "mode", "none");
    if (!success) {
      fprintf(stderr, "error setting mode to none\n");
      ret = SYSCALL_FAILED;
      goto cleanup;
    }
  }
cleanup:
  g_settings_sync();
  g_object_unref(setting);

  return ret;
}
