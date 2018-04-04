# This Makefile is GNU make compatible. You can get GNU Make from
# http://gnuwin32.sourceforge.net/packages/make.htm

CCFLAGS = -Wall -c

ifeq ($(OS),Windows_NT)
	os = windows
	CCFLAGS += -D WIN32
	# 32 bit `make` utility over 64 bit OS
	ifeq ($(PROCESSOR_ARCHITEW6432),AMD64)
		CCFLAGS += -D AMD64
		BIN = binaries/windows/sysproxy_amd64
	else
		ifeq ($(PROCESSOR_ARCHITECTURE),AMD64)
			CCFLAGS += -D AMD64
			BIN = binaries/windows/sysproxy_amd64
		endif
		ifeq ($(PROCESSOR_ARCHITECTURE),x86)
			CCFLAGS += -D IA32
			BIN = binaries/windows/sysproxy_386
		endif
	endif
	LDFLAGS += -l rasapi32 -l wininet -Wl,--subsystem,windows
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		os = linux
		CCFLAGS += -D LINUX $(shell pkg-config --cflags gio-2.0)
		LDFLAGS += $(shell pkg-config --libs gio-2.0)
		UNAME_P := $(shell uname -p)
		ifeq ($(UNAME_P),x86_64)
			CCFLAGS += -D AMD64
			BIN = binaries/linux_amd64/sysproxy
		endif
		ifneq ($(filter %86,$(UNAME_P)),)
			CCFLAGS += -D IA32
			BIN = binaries/linux_386/sysproxy
		endif
		ifneq ($(filter arm%,$(UNAME_P)),)
			CCFLAGS += -D ARM
			BIN = binaries/linux_arm/sysproxy
		endif
	endif
	ifeq ($(UNAME_S),Darwin)
		os = darwin
		CCFLAGS += -D DARWIN -D AMD64 -x objective-c
		LDFLAGS += -framework Cocoa -framework SystemConfiguration -framework Security
		BIN = binaries/darwin/sysproxy
	endif
endif

CC=gcc

all: $(BIN)
main.o: main.c common.h
	$(CC) $(CCFLAGS) $^
$(os).o: $(os).c common.h
	$(CC) $(CCFLAGS) $^
$(BIN): $(os).o main.o
	$(CC) -o $@ $^ $(LDFLAGS)

clean:
	rm *.o
