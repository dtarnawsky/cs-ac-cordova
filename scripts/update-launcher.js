let ANDROID_PROJECT_ROOT = "platforms/android/app/src/main";
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

function writeJavaLauncher() {}

function readManifest() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(ANDROID_PROJECT_ROOT, "AndroidManifest.xml"),
      "utf-8",
      (err, input) => {
        if (!!err) {
          reject(err);
        } else {
          resolve(input);
        }
      }
    );
  });
}

function writeManifest(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(ANDROID_PROJECT_ROOT, "AndroidManifest.xml"),
      data,
      (err) => {
        if (!!err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function convertToJson(input) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(input, (err, result) => {
      if (!!err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function convertToXML(input) {
  return new Promise((resolve, reject) => {
    let builder = new xml2js.Builder();
    let xml = builder.buildObject(input);
    resolve(xml);
  });
}

function removeLegacyActivityIntent(data) {
  return new Promise((resolve, reject) => {
    let applications = data.manifest.application;
    if (!applications) {
      reject();
      return;
    }
    applications.forEach((application) => {
      if (!!application.activity) {
        application.activity.forEach((activity) => {
          if (activity["intent-filter"]) {
            activity["intent-filter"].forEach((intent, idx) => {
              let shouldRemove = false;
              if (intent.action) {
                intent.action.forEach((action) => {
                  if (action["$"]["android:name"].includes("MAIN")) {
                    shouldRemove = true;
                  }
                });
              }
              if (shouldRemove) {
                delete activity["intent-filter"][idx];
              }
            });
          }
        });
      }
    });
    resolve(data);
  });
}

function addLauncherActivityIntent(data) {
  return new Promise((resolve, reject) => {
    let applications = data.manifest.application;
    if (!applications) {
      reject();
      return;
    }
    applications.forEach((application) => {
      if (typeof application.activity === "undefined") {
        application.activity = [];
      }
      application.activity.push({
        $: {
          "android:name": "LauncherActivity",
          "android:label": "@string/app_name",
          "android:theme": "@android:style/Theme.DeviceDefault.NoActionBar",
        },
        "intent-filter": [
          {
            action: {
              $: {
                "android:name": "android.intent.action.MAIN",
              },
            },
            category: {
              $: {
                "android:name": "android.intent.category.LAUNCHER",
              },
            },
          },
        ],
      });
    });
    resolve(data);
  });
}

module.exports = function (context) {
  return new Promise((resolve, reject) => {    
    readManifest()
      .then((input) => convertToJson(input))
      .then((data) => removeLegacyActivityIntent(data))
      .then((data) => addLauncherActivityIntent(data))
      .then((data) => convertToXML(data))
      .then((input) => writeManifest(input))
      .then((data) => {
        resolve("done");
        console.log('Applied fix for @ionic-enterprise/auth')
      })
      .catch((err) => {
        console.log(err);
        reject("done");
      });
  });
};