import React, { Fragment, useState } from "react";
import { Typography, Grid, Paper } from "@material-ui/core";

import ConfigPanel from "../components/ConfigPanel";
import Quicklook from "../components/Quicklook";

import Temp from "../img/temp.png";

export default function Add() {
  const [imgURL, setImgURL] = useState(Temp);
  const [imgDate, setImgDate] = useState(new Date());
  const [twoH, setTwoH] = useState(false);
  const [event, setEvent] = useState(null);

  const handleSetEvent = (params) => {
    if (event == null) {
      setEvent({ ...params });
    } else {
      setEvent({ ...event, ...params });
    }
  };

  const getImgURL = (url, isTwoH, date) => {
    console.log("Image has ascended");
    setTwoH(isTwoH);
    setImgDate(date);
    setImgURL(url);
  };

  return (
    <Fragment>
      <Grid container>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Add an event
          </Typography>
        </Grid>
      </Grid>
      <div>
        <Grid container justify="flex-end">
          <Grid item xs={8}>
            <Quicklook
              imgURL={imgURL}
              getImgURL={getImgURL}
              twoH={twoH}
              imgDate={imgDate}
              handleSetEvent={handleSetEvent}
            />
          </Grid>
          <Grid item xs={4}>
            <Paper style={{ padding: 16, margin: 16 }}>
              <ConfigPanel
                getImgURL={getImgURL}
                event={event}
                handleSetEvent={handleSetEvent}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
}
