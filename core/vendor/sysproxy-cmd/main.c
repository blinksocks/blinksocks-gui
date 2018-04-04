#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <signal.h>
#include "common.h"

void usage(const char* binName)
{
  printf("Usage: %s [show | on | off | wait-and-cleanup <proxy host> <proxy port>]\n", binName);
  exit(INVALID_FORMAT);
}

void turnOffProxyOnSignal(int signal)
{
  toggleProxy(false);
  exit(0);
}

void setupSignals()
{
  // Register signal handlers to make sure we turn proxy off no matter what
  signal(SIGABRT, turnOffProxyOnSignal);
  signal(SIGFPE, turnOffProxyOnSignal);
  signal(SIGILL, turnOffProxyOnSignal);
  signal(SIGINT, turnOffProxyOnSignal);
  signal(SIGSEGV, turnOffProxyOnSignal);
  signal(SIGTERM, turnOffProxyOnSignal);
  signal(SIGSEGV, turnOffProxyOnSignal);
}

int main(int argc, char* argv[]) {
  if (argc < 2) {
    usage(argv[0]);
  }

#ifdef DARWIN
  if (strcmp(argv[1], "setuid") == 0) {
    return setUid();
  }
#endif

  if (strcmp(argv[1], "show") == 0) {
    return show();
  } else {
    if (argc < 4) {
      usage(argv[0]);
    }
    proxyHost = argv[2];
    proxyPort = argv[3];
    if (strcmp(argv[1], "on") == 0) {
      return toggleProxy(true);
    } else if (strcmp(argv[1], "off") == 0) {
      return toggleProxy(false);
    } else if (strcmp(argv[1], "wait-and-cleanup") == 0) {
      setupSignals();
#ifdef _WIN32
      setupSystemShutdownHandler();
#endif
      // wait for input from stdin (or close), then toggle off
      getchar();
      return toggleProxy(false);
    } else {
      usage(argv[0]);
    }
  }
  // code never reaches here, just avoids compiler from complaining.
  return RET_NO_ERROR;
}
