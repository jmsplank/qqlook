import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Button, Grid } from "@material-ui/core";
import "./App.css";

import Add from "./pages/Add";

export default function App() {
  return (
    <Router>
      <Grid container style={{ padding: 5 }}>
        <Grid item align="center" xs={4}>
          <Button component={Link} color="default" to="/" variant="contained">
            Home
          </Button>
        </Grid>
        <Grid item align="center" xs={4}>
          <Button
            component={Link}
            color="primary"
            to="/add"
            variant="contained"
          >
            Add
          </Button>
        </Grid>
        <Grid item align="center" xs={4}>
          <Button
            component={Link}
            color="secondary"
            to="/explore"
            variant="contained"
          >
            Explore
          </Button>
        </Grid>
      </Grid>

      <Switch>
        <Route path="/add">
          <Add />
        </Route>
        <Route path="/explore"></Route>
        <Route path="/"></Route>
      </Switch>
    </Router>
  );
}
