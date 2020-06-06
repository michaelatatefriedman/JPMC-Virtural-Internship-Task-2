import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
    load: (table: Table) => void,
    /** extend HTMLElement to act as a HTMLElement**/
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
      if (this.table) {
          // Load the `table` in the `<perspective-viewer>` DOM reference.

          // Add more Perspective configurations here.
          elem.load(this.table);
          elem.setAttribute('view', 'y_line');
          /** visualize date as a continuous line graph to be the 
           * final outcome, the closest one would be y_line**/
          elem.setAttribute('column-pivots', '["stock"]');
          /** column-pivots allows us to distinguish stock ABC with DEF. 
           * We use ["stock"] as its corresponding value here. also defined in the schema object. 
           * it is accessible to other attributes**/
          elem.setAttribute('row-pivots', '["timestamp"]');
          /** row-pivots takes care of the x-axis. allows us to map 
           * each datapoint based on the timestamp it has
           * w/o this the x-axis is blank**/
          elem.setAttribute('columns', '["top_ask_price"]');
          /** column allows us to focus on a particular part of a stocks's
           * data along the y-axis. w/o this, the grpah will plot diff datapoints of 
           * a stock i.i: top_ask_price, top_bid_price, stock, timestamp. 
           * for this instance we only care about top_ask_price**/
          elem.setAttribute('aggregates', `
            { "stock": "distinct count",
                "top_ask_price": "avg",
                "top_bid_price": "avg",
                "timestamp":"distinct count"
            }`);
          /** aggregates allows us to handle the duplicated data we 
           * observed earlier and consolidated them as just one data point. we only
           * want to consider a data point unique if it has a unique stick name and 
           * timestamp. if there are duplicates like previously, we will
           * average out the top_bid_prices and the top_ask_prices of these 
           * 'similar' datapoints before treating them as one**/
      }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
