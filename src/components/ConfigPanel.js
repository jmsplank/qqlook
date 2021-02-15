import React, { Fragment, useState, useEffect } from "react";
import {
  Button,
  InputLabel,
  Grid,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

export default function ConfigPanel({ getImgURL, event, handleSetEvent }) {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 3);
  defaultDate.setHours(0, 0, 0, 0);
  const minDate = new Date("2015-01-01T00:00:00Z");
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [loading, setloading] = useState(false);
  const [location, setLocation] = useState({ x: null, y: null, x: null });

  function handleDateChange(momentDate) {
    let jsDate = new Date(momentDate);
    jsDate.setHours(0, 0, 0, 0);
    setSelectedDate(jsDate);
  }

  function get24hPlotURL(date) {
    const format = moment(date).format("YYYYMMDD");
    const URLstr = `https://lasp.colorado.edu/mms/sdc/public/data/sdc/ql/all_mms1_summ/${format.slice(0,4)}/${format.slice(4, 6)}/${format.slice(6,8)}/ql_all_mms1_summ_${format}_0000_1440.png`; // prettier-ignore
    console.log(URLstr);
    return URLstr;
  }

  const get24hPlot = async () => {
    setloading(true);
    const plotUrl = get24hPlotURL(selectedDate);
    const laspResponse = await fetch(plotUrl);
    const image = await laspResponse.blob();
    getImgURL(URL.createObjectURL(image), false, selectedDate);
    setloading(false);
  };

  const handleGetPlotFromForm = (event) => {
    event.preventDefault();
    get24hPlot();
  };

  function onXYZChange(event) {
    setLocation({ ...location, [event.target.name]: event.target.value });
  }

  const getEstimatedShockNormal = async () => {
    setloading(true);
    fetch(
      `http://127.0.0.1:5000/get_estimated_shock_normal?x=${location.x}&y=${location.y}&z=${location.z}`,
      { mode: "cors" }
    )
      .then((res) => res.json())
      .then((data) => {
        handleSetEvent({ angle: data.angle, location });
      })
      .catch((err) => alert(err));
    setloading(false);
  };

  const handleGetEstimatedShockNormal = (event) => {
    event.preventDefault();
    getEstimatedShockNormal();
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    // setloading(true);
    fetch("http://127.0.0.1:5000/shock_crossing", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
      .then((res) => alert("Uploaded successfully"))
      .catch((err) => alert(err));
  };

  function dateToStr(date, diff = null) {
    if (diff == null) {
      return moment(date).format("DD/MM/YY HH:mm:ss");
    } else {
      let tdiff = moment(date).diff(moment(diff), "seconds");
      if (tdiff > 60) {
        let mdiff = Math.floor(tdiff / 60);
        let sdiff = tdiff - mdiff * 60;
        return `${mdiff}m ${sdiff}s (${tdiff}s)`;
      }
      return `${tdiff}s`;
    }
  }

  function getPrePost(event) {
    let start = dateToStr(event.crossingStart, event.burstStart);
    let end = dateToStr(event.burstEnd, event.crossingEnd);
    if (event.direction == 1) {
      return [start, end];
    } else {
      return [end, start];
    }
  }

  return (
    <Fragment>
      <form onSubmit={handleGetPlotFromForm} noValidate>
        <Grid container align="center">
          <Grid item xs={6}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <InputLabel htmlFor="label-date-picker">Choose a date</InputLabel>
              <DatePicker
                id="label-date-picker"
                value={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={defaultDate}
                format="DD/MM/yyyy"
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              Get Plot
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid container align="center" style={{ marginTop: 30 }}>
        <Grid item xs={6}>
          <Button
            style={{ textTransform: "uppercase" }}
            variant="contained"
            color="secondary"
            startIcon={<ChevronLeftIcon />}
            onClick={() => {
              handleDateChange(
                selectedDate.setDate(selectedDate.getDate() - 1)
              );
              get24hPlot();
            }}
            disabled={
              selectedDate.setDate(selectedDate.getDate() - 1) < minDate ||
              loading
            }
          >
            Back 1 day
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            style={{ textTransform: "uppercase" }}
            variant="contained"
            color="secondary"
            endIcon={<ChevronRightIcon />}
            onClick={() => {
              handleDateChange(
                selectedDate.setDate(selectedDate.getDate() + 1)
              );
              get24hPlot();
            }}
            disabled={
              selectedDate.setDate(selectedDate.getDate() + 1) >= defaultDate ||
              loading
            }
          >
            Forward 1 day
          </Button>
        </Grid>
      </Grid>
      {event == null ? (
        <p>Select an event before you can see it's information.</p>
      ) : (
        <Fragment>
          <Grid container align="center">
            <Grid item xs={6}>
              <p>
                Burst interval start: <br /> {dateToStr(event.burstStart)}
              </p>
            </Grid>
            <Grid item xs={6}>
              <p>
                Burst interval end: <br /> {dateToStr(event.burstEnd)}
              </p>
            </Grid>
            <Grid item xs={12}>
              <p>
                Burst duration: <br />
                {dateToStr(event.burstEnd, event.burstStart)}
              </p>
            </Grid>
            <Grid item xs={6}>
              <p>
                Shock crossing start: <br /> {dateToStr(event.crossingStart)}
              </p>
            </Grid>
            <Grid item xs={6}>
              <p>
                Skock crossing end:
                <br />
                {dateToStr(event.crossingEnd)}
              </p>
            </Grid>
            <Grid item xs={12}>
              <p>
                Shock crossing duration: <br />
                {dateToStr(event.crossingEnd, event.crossingStart)}
              </p>
            </Grid>
            <Grid item xs={6}>
              <p>
                Time in SW: <br />
                {getPrePost(event)[0]}
              </p>
            </Grid>
            <Grid item xs={6}>
              <p>
                Time in magnetosheath: <br />
                {getPrePost(event)[1]}
              </p>
            </Grid>
          </Grid>
          <form noValidate onSubmit={handleGetEstimatedShockNormal}>
            <Grid container align="center" justify="center">
              <Grid item xs={3} style={{ padding: 5 }}>
                <TextField
                  type="number"
                  variant="outlined"
                  onChange={onXYZChange}
                  value={location.x}
                  name="x"
                  placeholder="GSE X (Re)"
                />
              </Grid>
              <Grid item xs={3} style={{ padding: 5 }}>
                <TextField
                  type="number"
                  variant="outlined"
                  onChange={onXYZChange}
                  value={location.y}
                  name="y"
                  placeholder="GSE Y (Re)"
                />
              </Grid>
              <Grid item xs={3} style={{ padding: 5 }}>
                <TextField
                  type="number"
                  variant="outlined"
                  onChange={onXYZChange}
                  value={location.z}
                  name="z"
                  placeholder="GSE Z (Re)"
                />
              </Grid>
              <Grid item xs={3} style={{ padding: 5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  Estimate Shock Normal
                </Button>
              </Grid>
              {event.angle != "undefined" && (
                <Grid item xs={12} style={{ padding: 5 }}>
                  Estimated angle: {event.angle} degeres
                </Grid>
              )}
            </Grid>
          </form>
          <form noValidate onSubmit={handleSaveEvent}>
            <Grid container align="center">
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  color="secondary"
                  disabled={loading}
                >
                  Save event
                </Button>
              </Grid>
            </Grid>
          </form>
        </Fragment>
      )}
    </Fragment>
  );
}
