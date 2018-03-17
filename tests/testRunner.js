require("dotenv").config();
var webdriver = require("selenium-webdriver");
var testDebug = require("debug")("retrotube/Test");
var testManagerDebug = require("debug")("retrotube/TestManager");
var asyncLib = require("async");
var assert = require("assert"); 
var tests = [];

var testQueue = asyncLib.queue(runTest, 5);

// assign a callback
testQueue.drain = function() {
  testManagerDebug("All tests completed");
};

async function addTest(browserName, device, os, os_version, browser_version) {
  tests.push({
    browserName: browserName,
    device: device,
    realMobile: "true",
    os: os,
    os_version: os_version,
    browser_version: browser_version,
    "browserstack.user": "jacobgeeclarke1",
    "browserstack.key": process.env.BROWSERSTACK_KEY,
    "browserstack.debug": true,
    "browserstack.console": "errors"
  });
}

async function addTests() {
  // Windows XP
  await addTest("IE", null, "Windows", "XP", "7.0");
  // await addTest("Firefox", null, "Windows", "XP", "47.0");
  // await addTest("Chrome", null, "Windows", "XP", "49.0");
  // await addTest("Opera", null, "Windows", "XP", "12.16");

  // Windows 7
  // await addTest("IE", null, "Windows", "7", "11.0");
  // await addTest("Firefox", null, "Windows", "7", "59.0");
  // await addTest("Chrome", null, "Windows", "7", "65.0");
  // await addTest("Opera", null, "Windows", "7", "12.16");

  // // Windows 8
  // await addTest("IE", null, "Windows", "8", "10.0");
  // await addTest("Firefox", null, "Windows", "8", "59.0");
  // await addTest("Chrome", null, "Windows", "8", "65.0");
  // await addTest("Opera", null, "Windows", "8", "12.16");

  // // Windows 8.1
  // await addTest("IE", null, "Windows", "8.1", "11.0");
  // await addTest("Firefox", null, "Windows", "8.1", "59.0");
  // await addTest("Chrome", null, "Windows", "8.1", "65.0");
  // await addTest("Opera", null, "Windows", "8.1", "12.16");

  // // Windows 10
  // await addTest("IE", null, "Windows", "10", "11.0");
  // await addTest("Edge", null, "Windows", "10", "16.0");
  // await addTest("Firefox", null, "Windows", "10", "59.0");
  // await addTest("Chrome", null, "Windows", "10", "65.0");
}

async function runTest(testParams) {
  testManagerDebug(
    `Test: ${testParams.os + testParams.os_version || testParams.device} + ${
      testParams.browserName
    } STARTED`
  );

  var driver = new webdriver.Builder()
    .usingServer("http://hub-cloud.browserstack.com/wd/hub")
    .withCapabilities(testParams)
    .build();

  try {
    await driver.get("https://retrotube.herokuapp.com/");
    testDebug(await driver.getTitle());
    assert(driver.getTitle().match(/RetroTube -- dead/i));
    await driver.quit();
    testManagerDebug(`Test: ${testParams.browserName} FINISHED`);
  } catch (error) {
    throw error;
  }
}

try {
  (async function() {
    testManagerDebug("Adding tests");
    await addTests();
    for (let index = 0; index < tests.length; index++) {
      if (typeof tests[index] != "undefined") {
        testManagerDebug(`Adding test: ${index} to the testQueue`);
        testQueue.push(tests[index]);
      }
      testManagerDebug("Tests added");
    }
  })();
} catch (error) {
  throw error;
}
