import React, { Component, Fragment, useState } from "react";
import {
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import UpdateIcon from "@material-ui/icons/Update";
import moment from "moment";

export default function Explore() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);

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
  function formatTime(secs) {
    if (secs > 60) {
      let mdiff = Math.floor(secs / 60);
      let sdiff = secs - mdiff * 60;
      return `${mdiff}m ${sdiff.toFixed(1)}s (${secs.toFixed(1)}s)`;
    }
    return `${secs.toFixed(1)}s`;
  }

  const handleGetEvents = (event) => {
    event.preventDefault();
    // setLoading(true);
    fetch("http://127.0.0.1:5000/shock_crossing", { mode: "cors" })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data) => setEvents(data));
  };

  const sortBy = (param) => {
    let sorted = events.events;
    switch (param) {
      case "burst":
        sorted.sort((a, b) =>
          new Date(a.burstStart) >= new Date(b.burstStart) ? -1 : 1
        );
        break;
      case "timeBurst":
        sorted.sort((a, b) => (a.timeBurst >= b.timeBurst ? -1 : 1));
        break;
      case "timeCrossing":
        sorted.sort((a, b) => (a.timeCrossing >= b.timeCrossing ? -1 : 1));
        break;
      case "timeSW":
        sorted.sort((a, b) => (a.timeSW >= b.timeSW ? -1 : 1));
        break;
      case "timeMag":
        sorted.sort((a, b) => (a.timeMag >= b.timeMag ? -1 : 1));
        break;
      default:
        break;
    }
    setEvents({ ...events, events: sorted });
  };

  return (
    <Fragment>
      <Grid container align="center">
        <Grid item xs={2} style={{ padding: 12 }}>
          <form onSubmit={handleGetEvents} noValidate>
            <Button
              size="small"
              variant="contained"
              startIcon={<UpdateIcon />}
              type="submit"
              color="primary"
            >
              {events == null ? <p>Get events</p> : <p>Update events</p>}
            </Button>
          </form>
        </Grid>
        <Grid item xs={2} style={{ padding: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => sortBy("burst")}
          >
            Burst Start
          </Button>
        </Grid>
        <Grid item xs={2} style={{ padding: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => sortBy("timeBurst")}
          >
            Burst Length
          </Button>
        </Grid>
        <Grid item xs={2} style={{ padding: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => sortBy("timeCrossing")}
          >
            Crossing Length
          </Button>
        </Grid>
        <Grid item xs={2} style={{ padding: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => sortBy("timeSW")}
          >
            Time in Solar Wind
          </Button>
        </Grid>
        <Grid item xs={2} style={{ padding: 12 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => sortBy("timeMag")}
          >
            Time in Magnetosphere
          </Button>
        </Grid>
      </Grid>
      {events != null && (
        <Grid container align="center">
          <Grid item xs={12} style={{ padding: 12 }}>
            <p>{events.length} events found.</p>
          </Grid>
          {events.events.map((event, index) => (
            <Grid item xs={6} style={{ padding: 12 }} key={index}>
              <Paper style={{ padding: 12 }} style={{ background: "#F5EFD0" }}>
                <Grid container>
                  <Grid item xs={6}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Start</TableCell>
                          <TableCell>{dateToStr(event.burstStart)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Crossing Start</TableCell>
                          <TableCell>
                            {dateToStr(event.crossingStart)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Burst duration</TableCell>
                          <TableCell>{formatTime(event.timeBurst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Time in SW</TableCell>
                          <TableCell>{formatTime(event.timeSW)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Estimated Angle</TableCell>
                          <TableCell>{event.angle}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={6}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>End</TableCell>
                          <TableCell>{dateToStr(event.burstEnd)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Crossing End</TableCell>
                          <TableCell>{dateToStr(event.crossingEnd)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Crossing Duration</TableCell>
                          <TableCell>
                            {formatTime(event.timeCrossing)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Time in Magnetosphere</TableCell>
                          <TableCell>{formatTime(event.timeMag)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Fragment>
  );
}
