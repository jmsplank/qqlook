import React, { useRef, useState, useEffect } from "react";
import p5 from "p5";
import moment from "moment";

export default function Quicklook({
  imgURL,
  getImgURL,
  twoH,
  imgDate,
  handleSetEvent,
}) {
  const ref = useRef("canvas");

  const Sketch = (p) => {
    let img;
    let burstIntervals;
    let currentBurst = null;
    let startX = null;

    let startTime = new Date(imgDate);
    let endTime = new Date(startTime.getTime());
    if (twoH) {
      endTime.setHours(endTime.getHours() + 2);
    } else {
      endTime.setHours(endTime.getHours() + 24);
    }

    let minCoord = 160;
    let maxCoord = 850;
    let burstY = 43;

    p.preload = () => {
      img = p.loadImage(imgURL);
    };

    function getBurstIntervals(pixels, width) {
      let out = [];
      let startPixel = -1;
      let endPixel = -1;
      for (let i = 0; i <= maxCoord - minCoord; i++) {
        let x = (i + minCoord + burstY * width) * 4;
        let value = pixels[x];
        if (value <= 127 && startPixel == -1) {
          startPixel = i + minCoord;
        } else if (value > 127 && startPixel != -1) {
          endPixel = i + minCoord - 1;
          out.push([startPixel, endPixel]);
          startPixel = -1;
        }
      }
      return out;
    }

    p.setup = () => {
      console.log("Canvas reloaded");
      let cnv = p.createCanvas(img.width, img.height);
      cnv.doubleClicked(doubleClick2h);
      img.loadPixels();
      burstIntervals = getBurstIntervals(img.pixels, img.width);
    };

    async function get2hPlotImage(start2hBlock) {
      const format = moment(start2hBlock).format("YYYYMMDD");
      const hourFormat = moment(start2hBlock).format("HH");
      const URLstr = `https://lasp.colorado.edu/mms/sdc/public/data/sdc/ql/all_mms1_summ/${format.slice(0,4)}/${format.slice(4, 6)}/${format.slice(6,8)}/ql_all_mms1_summ_${format}_${hourFormat}00_0120.png`; // prettier-ignore
      console.log(URLstr);
      const laspResponse = await fetch(URLstr);
      const image = await laspResponse.blob();
      getImgURL(URL.createObjectURL(image), true, start2hBlock);
    }

    function getTimeOfPixel(x, minCoord, maxCoord, startTime, endTime) {
      console.log(x);
      let diff = endTime.getTime() - startTime.getTime();
      let mSecondsPerPixel = diff / (maxCoord - minCoord);
      let deltamSeconds = (x - minCoord) * mSecondsPerPixel;
      let outDate = new Date(0);
      outDate.setTime(startTime.getTime() + deltamSeconds);
      return outDate;
    }

    function getTwoHoursBetween(x1, x2) {
      let out = [];
      let compare = new Date(x1.getTime());
      compare.setMinutes(0, 0, 0);
      let hours = x1.getHours();
      if (hours % 2 != 0) {
        hours += 1;
      }
      while (compare <= x2) {
        compare.setHours(hours);
        if (compare >= x1 && compare <= x2) {
          out.push(new Date(compare.getTime()));
        }
        hours = hours + 2;
      }
      return out;
    }

    function getPixelOfTime(t, minCoord, maxCoord, startTime, endTime) {
      let diff = endTime.getTime() - startTime.getTime();
      let tdelta = (t.getTime() - startTime.getTime()) * 1e-3;
      let pixelsPerSecond = (maxCoord - minCoord) / (1e-3 * diff);
      let deltapixels = Math.round(tdelta * pixelsPerSecond);
      return minCoord + deltapixels;
    }

    let hourBlocksTime = getTwoHoursBetween(startTime, endTime);
    let hourBlocks = hourBlocksTime.map((x) =>
      getPixelOfTime(x, minCoord, maxCoord, startTime, endTime)
    );

    function doubleClick2h() {
      console.log("You double clicked!");
      if (!twoH) {
        let blockIndex = hourBlocks.findIndex((x) => x > p.mouseX);
        const blockTime = hourBlocksTime[blockIndex - 1];
        get2hPlotImage(blockTime);
      }
    }

    p.draw = () => {
      p.image(img, 0, 0);

      if (!twoH) {
        let blockIndex = hourBlocks.findIndex((x) => x > p.mouseX);
        if (blockIndex != -1) {
          p.fill("#FFFFFF80");
          p.stroke("#00000020");
          p.rect(
            hourBlocks[blockIndex - 1],
            0,
            hourBlocks[blockIndex] - hourBlocks[blockIndex - 1],
            p.height
          );
        }
      } else {
        // Highlight Burst Intervals if mouse inside
        burstIntervals.forEach((burst) => {
          if (p.mouseX >= burst[0] && p.mouseX <= burst[1]) {
            p.noFill();
            p.stroke("#000000");
            p.rect(burst[0], 0, burst[1] - burst[0], p.height);
            currentBurst = burst;

            // Highlight click & drag area
            if (p.mouseIsPressed) {
              if (startX == null) {
                startX = p.mouseX;
              }
              p.fill("#00000080");
              p.noStroke();
              p.rect(
                p.min([p.mouseX, startX]),
                0,
                p.abs(p.mouseX - startX),
                p.height
              );
            } else if (startX != null) {
              let dirN;
              if (startX < p.mouseX) {
                dirN = 1;
              } else if (startX > p.mouseX) {
                dirN = -1;
              }
              if (startX != p.mouseX) {
                let burstStart = getTimeOfPixel(
                  burst[0],
                  minCoord,
                  maxCoord,
                  startTime,
                  endTime
                );
                let burstEnd = getTimeOfPixel(
                  burst[1],
                  minCoord,
                  maxCoord,
                  startTime,
                  endTime
                );
                let boxStart = getTimeOfPixel(
                  p.min([p.mouseX, startX]),
                  minCoord,
                  maxCoord,
                  startTime,
                  endTime
                );
                let boxEnd = getTimeOfPixel(
                  p.max([p.mouseX, startX]),
                  minCoord,
                  maxCoord,
                  startTime,
                  endTime
                );
                console.log(
                  `On ${moment(boxStart).format("DD/MM/YY")} => From: ${moment(
                    boxStart
                  ).format("HH:mm:ss")} | To: ${moment(boxEnd).format(
                    "HH:mm:ss"
                  )}`
                );

                handleSetEvent({
                  burstStart: burstStart,
                  burstEnd: burstEnd,
                  crossingStart: boxStart,
                  crossingEnd: boxEnd,
                  direction: dirN,
                });

                startX = null;
              }
            }
          }
        });

        // Zoom window
        let c = p.get(p.mouseX - 15, p.mouseY - 15, 30, 30);
        c.resize(60, 0);
        p.stroke(0);
        p.image(c, p.mouseX, p.mouseY);
        p.line(p.mouseX + 30, p.mouseY + 25, p.mouseX + 30, p.mouseY + 35);
        p.line(p.mouseX + 25, p.mouseY + 30, p.mouseX + 35, p.mouseY + 30);
      }
    };
  };

  useEffect(() => {
    let myp5 = new p5(Sketch, ref.current);
    return function cleanup() {
      myp5.remove();
    };
  });

  return <div id="canvas-container" ref={ref}></div>;
}
