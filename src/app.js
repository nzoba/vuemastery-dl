const delay = require("delay");
const puppeteer = require("puppeteer");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const login = require("./login");
const getCourseVideoList = require("./getCourseVideoList");

const run = async (courses, type) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  const videos = [];
  await login(page, process.env.EMAIL, process.env.PASSWORD);
  for (let index = 0; index < courses.length; index++) {
    let courseVideos = [];
    try {
      courseVideos = await getCourseVideoList(page, courses[index], type);
    } catch (err) {
      console.log(err);
    }
    if (type !== "complete") {
      let fileName = courses[index].split('https://www.vuemastery.com/courses/').pop().split('/')[0] + ".json";
      fse.outputFile(
        path.join(
          __dirname,
          "..",
          "course-video-lists",
          fileName.replace(" ", "-").toLowerCase()
        ),
        JSON.stringify(courseVideos)
      );
      videos.push(...courseVideos);
    }
  }

  fse.outputFile(
    path.join(__dirname, "..", "course-video-lists/all.json"),
    JSON.stringify(videos)
  );

  console.log("Closing browser.");
  await browser.close();
  console.log("Browser closed.");

  // await downloadVideos(videos);
};

module.exports = {
  run,
};
