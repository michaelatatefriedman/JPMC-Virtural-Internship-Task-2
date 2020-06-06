import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
    data: ServerRespond[],
    showGraph: boolean,
    /** helps us change the static table into a live/updating graph**/
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
        data: [],
        showGraph: false,
        /** initial state of the app not to show the graph yet, 
         * only shows it when we click 'start streaming data**/
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
      if (this.state.showGraph) {
          /** to ensure that the graph doesnt render until
            * a user clicks the 'Start Streaming Data' button **/
          return (<Graph data={this.state.data} />)
      }
  }

  /**
   * Get new data from server and update the state with the new data
   * Modified the method to contact the server and get data from it 
   * continuously instead of just getting data from it once eveery time you click the button.
   * Javascript does things in intervals, via the setInterval function
  **/
    getDataFromServer() {
        let x = 0;
        const interval = setInterval(() => { 
            DataStreamer.getData((serverResponds: ServerRespond[]) => {
                this.setState({
                    data: serverResponds,
                    showGraph: true,
                    /** as soon as the data from the server comes back to the requestor**/
                });
            });
            x++;
            if (x > 1000) {
                clearInterval(interval);
            }
        }, 100);
    }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
