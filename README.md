# Easier to use version of the MMS quicklook plots

## Contents

- [Easier to use version of the MMS quicklook plots](#easier-to-use-version-of-the-mms-quicklook-plots)
  * [Requirements](#requirements)
  * [Starting the server](#starting-the-server)
  * [How to Use](#how-to-use)
    + [ADD](#add)
      - [Picture window](#picture-window)
      - [Control Panel](#control-panel)
    + [EXPLORE](#explore)
  * [Python Backend](#python-backend)
    + [127.0.0.1:5000/](#127001-5000-)
    + [127.0.0.1:5000/shock_crossing](#127001-5000-shock-crossing)
      - [GET shock_crossing](#get-shock-crossing)
      - [POST shock_crossing](#post-shock-crossing)
    + [127.0.0.1:5000/get_estimated_shock_normal (GET)](#127001-5000-get-estimated-shock-normal--get-)
  * [NPM Options](#npm-options)
    + [`npm start`](#-npm-start-)
    + [`npm test`](#-npm-test-)
    + [`npm run build`](#-npm-run-build-)
    + [`npm run eject`](#-npm-run-eject-)
  * [Learn More](#learn-more)
    + [Code Splitting](#code-splitting)
    + [Analyzing the Bundle Size](#analyzing-the-bundle-size)
    + [Making a Progressive Web App](#making-a-progressive-web-app)
    + [Advanced Configuration](#advanced-configuration)
    + [Deployment](#deployment)
    + [`npm run build` fails to minify](#-npm-run-build--fails-to-minify)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Requirements

This project requires a recent version of node and npm, i.e.

`node >= v14.15.4`

`npm >= 6.14.10`

To run the python webserver, python>=3.8.5 is recommended (untested on other versions), along with a compatible version of `pip`.

The required modules are: flask, numpy, tinydb & pybowshock (to get estimated shock normals (note: must be installed in site_packages))

## Starting the server

From the main directory:

To start the python webserver, run:

`python/runserver.sh`

Which will start the server on 127.0.0.1:5000.

To start the main web app, run:

`npm start`

Which will start a server on localhost:3000. Navigating to localhost:3000 in a web browser will start the app.

## How to Use

There are two main pages 'add' and 'explore':

### ADD

This page controls all aspects of looking for & adding new events. On the right there is a picture window, and on the left is a control panel. The picture window will hold the relevant quicklook plot (either a 24h plot or a 2h one). The control panel is where you can pick the focus day, navigate by +-1 day, and will show information about the most recently selected event (if an event has been selected).

#### Picture window

When a 24h plot is loaded, moving the mouse over the graph will highlight the range of the 2h plots. Double clicking anywhere inside a highlighted region will load the selected 2h plot into the picture window. To get back to a 24h view, click 'get plot' in the conrol panel.

When a 2h plot is loaded, mousing over any region with burst data (green bars at the top) will highlight that region. The mouse will also have a zoom box with crosshairs in the middle to assist with accurate selection. To select a shock crossing, make sure it is covered by a burst region, then, starting with the mouse on the solar wind side of the crossing, click and drag over the whole region. A dark box will appear to show the selection area. It is important to start from the solar wind side as that is how some of the statistics are generated.

#### Control Panel

The control panel shows all the controls for adding a new event. The first thing to do is select a date of interest. This can be done by clicking on the 'choose a date' box to open the date picker window. Once a date has been chosen, click 'get plot' to load the plot into the picture window.

You can then navigate day-by-day by clicking on the 'forward 1 day' or 'back 1 day' buttons. Clicking these will automatically load the next quicklook plot.

When an event has been selected, you will see some statistics about that event: Burst interval start, end, and duration, shock crossing start, end and duration, time in solar wind, time in magnetosheath, and options to add information about shock normal angle. With an event in the window, you can add the spacecraft location (in GSE XYZ) to the boxes, SC location can be found at the bottom of the quicklook plot. With the three values filled in, click 'estimate shock normal' to run an empirical model to find the angle of the shock normal. This value will show up underneath the button. (be cautious with this value).

Click 'save event' to upload it to the database, an alert box will show up notifying you of the success/failure.

### EXPLORE

Clicking 'get events' will query the database and return all events. They will show up as a 2xn/2 grid below the buttons. 

There are a set of buttons along the top to sort the events by various key statistics. They will always be ordered largest -> smallest. By default, they are returned in the order they were originally added to the database earliest -> latest.


## Python Backend

There are 3 routes currently in the backend.

### 127.0.0.1:5000/

Use this to check if the server is running. You should see 'Hello World' displayed in and H1 tag when loading from a web browser.

### 127.0.0.1:5000/shock_crossing

#### GET shock_crossing

Performing a get request will return all events currently in `db.json`. The json return is structured as follows:

```
{
  "length": 1,
  "events": [
    {
      "burstStart": "2021-01-12T02:48:10.434Z",
      "burstEnd": "2021-01-12T03:01:23.478Z",
      "crossingStart": "2021-01-12T02:54:15.652Z",
      "crossingEnd": "2021-01-12T02:57:44.347Z",
      "direction": 1,
      "angle": "73.0",
      "location": {
        "x": "10.2",
        "y": "11.5",
        "z": "-5.7"
      },
      "timeBurst": 793.044,
      "timeCrossing": 208.695,
      "timeSW": 365.218,
      "timeMag": 219.131
    }
  ]
}
```

#### POST shock_crossing

POSTing to shock_crossing is how events are added to `db.json`. Events must be supplied one at a time (i.e. One POST for each event). The body must contain JSON with this structure:

```
{
  "burstStart": "2021-01-12T02:48:10.434Z",
  "burstEnd": "2021-01-12T03:01:23.478Z",
  "crossingStart": "2021-01-12T02:54:15.652Z",
  "crossingEnd": "2021-01-12T02:57:44.347Z",
  "direction": 1,
  "angle": "73.0",
  "location": {
    "x": "10.2",
    "y": "11.5",
    "z": "-5.7"
  },
  "timeBurst": 793.044,
  "timeCrossing": 208.695,
  "timeSW": 365.218,
  "timeMag": 219.131
}
```

### 127.0.0.1:5000/get_estimated_shock_normal (GET)

A get request to this URL will return the estimated shock normal angle in degeres. X, Y, & Z coordinates (GSE, Re) are supplied as arguments in the url. e.g. to get the shock normal for the position (10.2, 11.5, -5.7), GET:

`http://127.0.0.1:5000/get_estimated_shock_normal?x=10.2&y=11.5&z=-5.7`

The response will be JSON with this form (note that the angle is a string):

```
{
    "angle": "73.0"
}
```

## NPM Options

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
