// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. 
#include "AZ3166WiFi.h"
#include "DevKitMQTTClient.h"
#include "RGB_LED.h"
#include <ArduinoJson.h>
#include <math.h>

#define INTERVAL 2000
#define MESSAGE_MAX_LEN 256

static bool hasWifi = false;

const int screenWidth = 128;
const int screenHeight = 64;
const size_t frameBufferSize = (screenWidth * screenHeight) / 8;
const size_t gifSizeLimit = 6;
static unsigned char gif[gifSizeLimit][frameBufferSize];

static size_t frameLength;
static int frameWidth;
static int frameHeight;
static int frameCount;
static float paintOffsetX;
static float pages; 

static bool isPlaying = false;
static int currentFramePlaying = 0;

void populateGif(JsonVariant frames) {
  LogInfo("populating gif...\n");
  for (int i = 0; i < frameCount; i++) {
    frames[i].asArray().copyTo(gif[i], frameLength);
  }
  LogInfo("finished populating gif.\n");
  Screen.clean();
}

static JsonObject& parsePayload(const unsigned char *payload) {
  LogInfo("parsing payload\n");
  DynamicJsonBuffer dBuffer;
  JsonObject &payloadBuffer = dBuffer.parseObject(payload);
  if (payloadBuffer["frames"].success()) {
    LogInfo("parsing payload was successful\n");
    return payloadBuffer;
  } else {
    return dBuffer.createObject();
  }
}

static void loadGif(JsonObject& payloadBuffer) {
  LogInfo("loading gif into memory\n");
  isPlaying = false;
  currentFramePlaying = 0;
  Screen.clean();

  frameWidth = payloadBuffer["size"][0];
  frameHeight = payloadBuffer["size"][1];
  frameLength = ceil((frameWidth * frameHeight) / 8);
  frameCount = payloadBuffer["frames"].asArray().size();
  pages = floor(frameHeight/8); 
  paintOffsetX = floor((screenWidth - frameWidth)/2);

  populateGif(payloadBuffer["frames"]);
  isPlaying = true;
}

static void InitWifi() {
  Screen.print(3, "connecting...");
  
  if (WiFi.begin() == WL_CONNECTED) {
    hasWifi = true;
    Screen.print(3, "connected!");
  } else {
    hasWifi = false;
    Screen.print(3, "No Wi-Fi");
  }
}

static int DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size) {
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;

  LogInfo("received device method call\n\n");
  
  if (strcmp(methodName, "showGif") == 0) { 
    JsonObject& payloadBuffer = parsePayload(payload);
    if (payloadBuffer.size()) {
      loadGif(payloadBuffer);
    }
  } else { 
    Screen.print(1, "no method found");
    responseMessage = "\"No method found\"";
    result = 404;
  }


  *response_size = strlen(responseMessage);
  *response = (unsigned char *)malloc(*response_size);
  strncpy((char *)(*response), responseMessage, *response_size);

  return result;
}

void setup() {
  Screen.init();

  InitWifi();
  if (!hasWifi) {
    return;
  }

  DevKitMQTTClient_Init(true);
  DevKitMQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);

  Screen.print(0, "send me a GIF!");
  Screen.print(3, "waiting...");
}

void loop() {
  if (isPlaying) {
    Screen.draw((int)paintOffsetX, 0, frameWidth+(int)paintOffsetX, pages, gif[currentFramePlaying]);
    currentFramePlaying = (currentFramePlaying < frameCount - 1) ? currentFramePlaying + 1 : 0;
  }

  DevKitMQTTClient_Check();
  delay(66);
}
