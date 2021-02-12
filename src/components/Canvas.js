import React from "react";
import p5 from "p5";

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    var outside;

    let img;
    let startX = null;

    let startTime = new Date("2021-02-06T00:00:00Z");
    let endTime = new Date("2021-02-07T00:00:00Z");

    let minCoord = 160;
    let maxCoord = 850;

    function getTimeOfPixel(x, minCoord, maxCoord, startTime, endTime) {
      console.log(x);
      let diff = endTime.getTime() - startTime.getTime();
      let secondsPerPixel = (1e-3 * diff) / (maxCoord - minCoord);
      let deltaSeconds = (x - minCoord) * secondsPerPixel;
      let outDate = new Date(startTime.toISOString());
      outDate.setSeconds(deltaSeconds);
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
      console.log(out);
      return out;
    }

    function getPixelOfTime(t, minCoord, maxCoord, startTime, endTime) {
      let diff = endTime.getTime() - startTime.getTime();
      let tdelta = (t.getTime() - startTime.getTime()) * 1e-3;
      let pixelsPerSecond = (maxCoord - minCoord) / (1e-3 * diff);
      let deltapixels = Math.round(tdelta * pixelsPerSecond);
      return minCoord + deltapixels;
    }

    let hourBlocks = getTwoHoursBetween(startTime, endTime).map((x) =>
      getPixelOfTime(x, minCoord, maxCoord, startTime, endTime)
    );

    p.setup = () => {
      console.log("or preload?");
      fetch(this.props.imgURL)
        //                         vvvv
        .then((response) => response.blob())
        .then((images) => {
          // Then create a local URL for that image and print it
          outside = URL.createObjectURL(images);
          console.log(outside);
        })
        .then(() => {
          p.loadImage(outside, (res) => {
            img = res;
            p.createCanvas(img.width, img.height);
          });
        });
    };

    p.draw = () => {
      p.image(img, 0, 0);

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
      } else {
        if (startX != null) {
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
            `From: ${boxStart.toISOString()} to ${boxEnd.toISOString()}`
          );
          startX = null;
        }
      }
    };
  };

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  render() {
    return <div ref={this.myRef}></div>;
  }
}
