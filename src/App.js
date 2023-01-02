import React, { Component } from "react";
import "./styles/App.css";
import EventList from "./EventList";
import CitySearch from "./CitySearch";
import NumberOfEvents from "./NumberOfEvents";
import "./styles/nprogress.css";
import { InfoAlert } from "./Alert";
import WelcomeScreen from "./WelcomeScreen";
import { getEvents, extractLocations, checkToken, getAccessToken } from "./api";

class App extends Component {
  state = {
    events: [],
    locations: [],
    showWelcomeScreen: undefined,
  };

  updateEvents = (location, events) => {
    getEvents().then((events) => {
      const locationEvents =
        location === "all"
          ? events
          : events.filter((event) => event.location === location);
      this.setState({
        events: locationEvents.slice(0, this.state.events),
      });
    });
  };

  async componentDidMount() {
    this.mounted = true;
    const accessToken = localStorage.getItem("access_token");
    const isTokenValid = (await checkToken(accessToken)).error ? false : true;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    this.setState({ showWelcomeScreen: !(code || isTokenValid) });
    if ((code || isTokenValid) && this.mounted) {
      getEvents().then((events) => {
        if (this.mounted) {
          this.setState({
            events: events.slice(0, this.state.events),
            locations: extractLocations(events),
          });
        }
      });
  } else {
    getEvents().then((events) => {
      if (this.mounted) {
        this.setState({
          showWelcomeScreen: false,
          events: events.slice(0, this.state.events),
          locations: extractLocations(events),
        });
      }
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
      if (this.state.showWelcomeScreen === undefined){
      return <div className="App" />;
    }
    return (
      <div className="App">
        {!navigator.onLine && (
          <InfoAlert
            className="alert-centered"
            text="App is currently offline. You are seeing your cached data."
          />
        )}
        <CitySearch
          locations={this.state.locations}
          updateEvents={this.updateEvents}
        />
        <NumberOfEvents updateEvents={this.updateEvents} />
        <EventList events={this.state.events} />
        <WelcomeScreen
          showWelcomeScreen={this.state.showWelcomeScreen}
          getAccessToken={() => {
            getAccessToken();
          }}
        />
      </div>
    );
  }
}

export default App;
