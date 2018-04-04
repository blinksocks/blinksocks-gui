#import <Foundation/NSArray.h>
#import <Foundation/Foundation.h>
#import <SystemConfiguration/SCPreferences.h>
#import <SystemConfiguration/SCNetworkConfiguration.h>

#include <sys/syslimits.h>
#include <sys/stat.h>
#include <mach-o/dyld.h>
#include "common.h"

/* === implement details === */

typedef Boolean (*visitor) (SCNetworkProtocolRef proxyProtocolRef, NSDictionary* oldPreferences, bool turnOn, const char* pacUrl);

Boolean showAction(SCNetworkProtocolRef proxyProtocolRef/*unused*/, NSDictionary* oldPreferences, bool turnOn/*unused*/, const char* pacUrl/*unused*/)
{
  NSNumber* on = [oldPreferences valueForKey:(NSString*)kSCPropNetProxiesProxyAutoConfigEnable];
  NSString* nsOldPacUrl = [oldPreferences valueForKey:(NSString*)kSCPropNetProxiesProxyAutoConfigURLString];
  if ([on intValue] == 1) {
    printf("%s\n", [nsOldPacUrl UTF8String]);
  }
  return TRUE;
}

Boolean toggleAction(SCNetworkProtocolRef proxyProtocolRef, NSDictionary* oldPreferences, bool turnOn, const char* pacUrl)
{
  NSString* nsPacUrl = [[NSString alloc] initWithCString: pacUrl encoding:NSUTF8StringEncoding];
  NSString* nsOldPacUrl;
  NSMutableDictionary *newPreferences = [NSMutableDictionary dictionaryWithDictionary: oldPreferences];
  Boolean success;

  if(turnOn == true) {
    [newPreferences setValue:[NSNumber numberWithInt:1] forKey:(NSString*)kSCPropNetProxiesProxyAutoConfigEnable];
    [newPreferences setValue:nsPacUrl forKey:(NSString*)kSCPropNetProxiesProxyAutoConfigURLString];
  } else {
    nsOldPacUrl = [oldPreferences valueForKey:(NSString*)kSCPropNetProxiesProxyAutoConfigURLString];
    // we turn pac off only if the option is set and pac url has the provided
    // prefix.
    if (nsPacUrl.length == 0 || [nsOldPacUrl hasPrefix:nsPacUrl]) {
      [newPreferences setValue:[NSNumber numberWithInt:0] forKey:(NSString*)kSCPropNetProxiesProxyAutoConfigEnable];
      [newPreferences setValue:@"" forKey:(NSString*)kSCPropNetProxiesProxyAutoConfigURLString];
    }
  }

  success = SCNetworkProtocolSetConfiguration(proxyProtocolRef, (__bridge CFDictionaryRef)newPreferences);
  if(!success) {
    NSLog(@"Failed to set Protocol Configuration");
  }
  return success;
}

int visit(visitor v, bool persist, bool turnOn, const char* pacUrl)
{
  int ret = RET_NO_ERROR;
  Boolean success;

  SCNetworkSetRef networkSetRef;
  CFArrayRef networkServicesArrayRef;
  SCNetworkServiceRef networkServiceRef;
  SCNetworkProtocolRef proxyProtocolRef;
  NSDictionary *oldPreferences;

  // Get System Preferences Lock
  SCPreferencesRef prefsRef = SCPreferencesCreate(NULL, CFSTR("org.getlantern.lantern"), NULL);

  if(prefsRef==NULL) {
    NSLog(@"Fail to obtain Preferences Ref");
    ret = NO_PERMISSION;
    goto freePrefsRef;
  }

  success = SCPreferencesLock(prefsRef, true);
  if (!success) {
    NSLog(@"Fail to obtain PreferencesLock");
    ret = NO_PERMISSION;
    goto freePrefsRef;
  }

  // Get available network services
  networkSetRef = SCNetworkSetCopyCurrent(prefsRef);
  if(networkSetRef == NULL) {
    NSLog(@"Fail to get available network services");
    ret = SYSCALL_FAILED;
    goto freeNetworkSetRef;
  }

  //Look up interface entry
  networkServicesArrayRef = SCNetworkSetCopyServices(networkSetRef);
  networkServiceRef = NULL;
  for (long i = 0; i < CFArrayGetCount(networkServicesArrayRef); i++) {
    networkServiceRef = CFArrayGetValueAtIndex(networkServicesArrayRef, i);

    // Get proxy protocol
    proxyProtocolRef = SCNetworkServiceCopyProtocol(networkServiceRef, kSCNetworkProtocolTypeProxies);
    if(proxyProtocolRef == NULL) {
      NSLog(@"Couldn't acquire copy of proxyProtocol");
      ret = SYSCALL_FAILED;
      goto freeProxyProtocolRef;
    }

    oldPreferences = (__bridge NSDictionary*)SCNetworkProtocolGetConfiguration(proxyProtocolRef);
    if (!v(proxyProtocolRef, oldPreferences, turnOn, pacUrl)) {
      ret = SYSCALL_FAILED;
    }

freeProxyProtocolRef:
    CFRelease(proxyProtocolRef);
  }

  if (persist) {
    success = SCPreferencesCommitChanges(prefsRef);
    if(!success) {
      NSLog(@"Failed to Commit Changes");
      ret = SYSCALL_FAILED;
      goto freeNetworkServicesArrayRef;
    }

    success = SCPreferencesApplyChanges(prefsRef);
    if(!success) {
      NSLog(@"Failed to Apply Changes");
      ret = SYSCALL_FAILED;
      goto freeNetworkServicesArrayRef;
    }
  }

  //Free Resources
freeNetworkServicesArrayRef:
  CFRelease(networkServicesArrayRef);
freeNetworkSetRef:
  CFRelease(networkSetRef);
freePrefsRef:
  SCPreferencesUnlock(prefsRef);
  CFRelease(prefsRef);

  return ret;
}

/* === public functions === */
int setUid()
{
  char exeFullPath [PATH_MAX];
  uint32_t size = PATH_MAX;
  if (_NSGetExecutablePath(exeFullPath, &size) != 0)
  {
    printf("Path longer than %d, should not occur!!!!!", size);
    return SYSCALL_FAILED;
  }
  if (chown(exeFullPath, 0, 0) != 0) // root:wheel
  {
    puts("Error chown");
    return NO_PERMISSION;
  }
  if (chmod(exeFullPath, S_IRWXU | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH | S_ISUID) != 0)
  {
    puts("Error chmod");
    return NO_PERMISSION;
  }
  return RET_NO_ERROR;
}

int show()
{
  return visit(&showAction, false, false /*unused*/, "" /*unused*/);
}

int togglePac(bool turnOn, const char* pacUrl)
{
  return visit(&toggleAction, true, turnOn, pacUrl);
}
